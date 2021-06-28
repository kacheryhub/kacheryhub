#!/usr/bin/env python3

import os
import json

def create_doc_ts_file(folder: str, output_fname: str) -> None:
    ret = {'files': {}}
    for a in os.listdir(folder):
        if a.endswith('.md'):
            fname = folder + '/' + a
            with open(fname, 'r') as f:
                txt = f.read()
            ret['files'][a] = {'content': txt}
    ret_json = json.dumps(ret)
    #ret_json_b64 = base64.b64encode(ret_json.encode('utf-8'))
    #_write_file_if_changed(output_fname, f'const x = JSON.parse(atob("{ret_json_b64}"))\nexport default x')
    _write_file_if_changed(output_fname, f'const x = {ret_json};\nexport default x')

def _write_file_if_changed(fname, txt):
    if os.path.exists(fname):
        with open(fname, 'r') as f:
            old_text = f.read()
    else:
        old_text = None
    if txt != old_text:
        print(f'Writing {fname}')
        with open(fname, 'w') as f:
            f.write(txt)

if __name__ == '__main__':
    thisdir = os.path.dirname(os.path.realpath(__file__))
    create_doc_ts_file(f'{thisdir}/../../doc', f'{thisdir}/../../src/docMd.ts')