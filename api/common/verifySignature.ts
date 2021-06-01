import { serialize as bsonSerialize } from 'bson'
import { elapsedSince, PublicKey, Signature, Timestamp } from '../../src/common/kacheryTypes/kacheryTypes'
import crypto from 'crypto'

const kacheryP2PSerialize = (x: Object) => {
    return bsonSerialize(sortKeysInObject(x));
}

const sortKeysInObject = (x: any): any => {
    if (x instanceof Buffer) {
        return x;
    }
    else if (x instanceof Object) {
        if (Array.isArray(x)) {
            return x.map(a => (sortKeysInObject(a)));
        }
        else {
            const keys = Object.keys(x).sort();
            let ret: any = {};
            for (let k of keys) {
                ret[k] = sortKeysInObject(x[k]);
            }
            return ret;
        }
    }
    else {
        return x;
    }
}

const verifySignature = (obj: Object & {timestamp?: Timestamp}, signature: Signature, publicKey: PublicKey, opts={checkTimestamp: false}): boolean => {
    /* istanbul ignore next */
    if (opts.checkTimestamp) {
        if (!obj.timestamp) {
            return false;
        }
        const elapsed = elapsedSince(obj.timestamp)
        // needs to be less than 30 minutes old
        const numMinutes = 30;
        if (elapsed > numMinutes * 60 * 1000) {
            return false;
        }
    }
    try {
        const verified = crypto.verify(null, kacheryP2PSerialize(obj), publicKey.toString(), Buffer.from(signature.toString(), 'hex')) 
        // why does typescript think that verified is a buffer? it should be boolean!
        return verified as any as boolean
    }
    catch(err) {
        /* istanbul ignore next */
        return false;
    }
}

export default verifySignature