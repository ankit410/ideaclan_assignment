
const userRoles:Record<string, string> = {
    "frontend": "Frontend",
    "backend": "Backend",
    "devops": "DevOps",
    "uiDesigner": "UI Designer",
    "contentWriter": "Content Writer",
}

export const formatRole = (role: string) => {  
    return userRoles[role]
}

export const getUserRoles = () => {
    return Object.keys(userRoles).map((key)=>({label: userRoles[key], value: key }))
}