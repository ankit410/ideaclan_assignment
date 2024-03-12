export const formatDate = (date: string) => date ? new Date(date).toLocaleDateString(undefined,
    { year: 'numeric', month: 'long', day: 'numeric' }) : "NA"
