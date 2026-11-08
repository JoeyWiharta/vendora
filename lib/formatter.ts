export const formatRupiah = (value?: number) => `Rp${(Number.isFinite(value) ? (value as number) : 0).toLocaleString("id-ID")}`

export const formatFileSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

export const formatNumber = (value?: number) => (Number.isFinite(value) ? (value as number) : 0).toLocaleString("id-ID")

export const formatDate = (date: Date) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date)