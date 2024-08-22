import { publicDecrypt } from "crypto";

export class Image {
  constructor(
    public userId:string,
    public userEmail: string,
    public Id: number,
    public src: string,
    public href: string,
    public description: string,
    public year: number,
    public make: string,
    public model: string,
    public price:string,
    public isForSale:boolean,
    public isSold: boolean
  ) {}
}
