import { UserId } from "../../src/kachery-js/types/kacheryTypes";

const ADMIN_USERS = JSON.parse(process.env.ADMIN_USERS || "[]")

const isAdminUser = (userId: UserId) => {
    return ADMIN_USERS.includes(userId.toString())
}

export default isAdminUser