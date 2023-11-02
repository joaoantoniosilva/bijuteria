
import { Injectable } from '@nestjs/common';
import { Bijuteria } from './bijuteria.entity';

@Injectable()
export class BijuteriaService {
  private bijuteries: Bijuteria[] = [];

  create(bijuteria: Bijuteria): Bijuteria {
    this.bijuteries.push(bijuteria);
    return bijuteria;
  }

  findAll(): Bijuteria[] {
    return this.bijuteries;
  }

  findOne(id: number): Bijuteria {
    return this.bijuteries.find(bijuteria => bijuteria.id === id);
  }

  update(id: number, bijuteria: Bijuteria): Bijuteria {
    const existingBijuteria = this.findOne(id);
    if (existingBijuteria) {
      Object.assign(existingBijuteria, bijuteria);
      return existingBijuteria;
    }
    return null;
  }

  delete(id: number): boolean {
    this.bijuteries = this.bijuteries.filter(bijuteria => bijuteria.id !== id);
    return true;
 }
}