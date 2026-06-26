import { Injectable, signal } from '@angular/core';
import { IProduct } from '../interfaces/product';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Product {
  products = signal<IProduct[]>([]);
  private apiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) { }

  // El backend protege todas las rutas de /productos con JWT, así que toda petición debe enviar el token
  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(
      `${this.apiUrl}/productos`,
      this.getAuthHeaders()
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
    return this.http.post<IProduct>(`${this.apiUrl}/productos`, product, this.getAuthHeaders());
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`, this.getAuthHeaders());
  }

  updateProduct(id: number, product: IProduct): Observable<IProduct> {
    return this.http.put<IProduct>(`${this.apiUrl}/productos/${id}`, product, this.getAuthHeaders());
  }

  viewProduct(id: number): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.apiUrl}/productos/${id}`, this.getAuthHeaders());
  }
}
