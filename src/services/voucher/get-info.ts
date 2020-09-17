export interface VoucherInfo {
  valid: boolean
  chunk: number
}

export const getInfo = (voucher: string) => {
  const valid = !voucher || +voucher >= 0

  return {
    valid,
    chunk: +voucher || 0,
  } as VoucherInfo
}
