interface Jewelry {
 id: number;
 name: string;
 price: number;
}

class JewelryApi {
 private jewelries: Jewelry[] = [];

 constructor() {
    this.jewelries.push({ id: 1, name: 'Pulseira de Diamantes', price: 2500 });
 }

 public getAll(): Jewelry[] {
    return this.jewelries;
 }

 public getById(id: number): Jewelry | null {
    const jewelry = this.jewelries.find(j => j.id === id);
    return jewelry || null;
 }

 public create(name: string, price: number): Jewelry {
    const newJewelry: Jewelry = { id: this.jewelries.length + 1, name, price };
    this.jewelries.push(newJewelry);
    return newJewelry;
 }

 public update(id: number, name: string, price: number): Jewelry | null {
    const jewelry = this.getById(id);
    if (!jewelry) {
        return null;
    }
    jewelry.name = name;
    jewelry.price = price;
    return jewelry;
 }

 public delete(id: number): boolean {
    const index = this.jewelries.findIndex(j => j.id === id);
    if (index === -1) {
        return false;
    }
    this.jewelries.splice(index, 1);
    return true;
 }
}

export default JewelryApi;