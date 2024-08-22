import { publicDecrypt } from "crypto";

export class PaymentDetail {
  constructor(
    public Id: number,
    public cardnumber: string,
    public cardHolderName: string,
    public expiryDate:string,
    public cvv:string
  ) {}
}
