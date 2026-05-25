import { Injectable, signal } from '@angular/core';
import { IProduct } from '../interfaces/product';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Product {
  products = signal<IProduct[]>([]);

  constructor(private http: HttpClient) { }

  getProducts(): Observable<IProduct[]> {
    let token = localStorage.getItem('token') || '';
    console.log('Token from localStorage:', token);
    return this.http.get<IProduct[]>(
      'http://localhost:3000/productos',
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      map((resp: any) => resp.productos)
    );
  }

  loadProducts(): void {
    this.getProducts().subscribe();
  }

  generateProductCode(): string {
    const randomNum = Math.floor(Math.random() * (100 - 10) + 10);
    return `PROD${randomNum.toString().padStart(3, '0')}`;
  }

  saveProduct(product: IProduct): Observable<IProduct> {
    return this.http.post<IProduct>('http://localhost:3000/productos', product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/productos/${id}`);
  }

  updateProduct(id: number, product: IProduct): Observable<IProduct> {
    return this.http.put<IProduct>(`http://localhost:3000/productos/${id}`, product);
  }

  viewProduct(id: number): Observable<IProduct> {
    return this.http.get<IProduct>(`http://localhost:3000/productos/${id}`);
  }
}
