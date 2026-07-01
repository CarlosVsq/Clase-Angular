import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductSalesAnalytics {
  private http = inject(HttpClient);
  private apiUrl = environment.apiEndpoint;

  getSales() {
    return [
      {"name": "Móviles", "value": 100000},
      {"name": "Notebooks", "value": 55000},
      {"name": "Estufas", "value": 15000},
      {"name": "Televisores", "value": 150000},
      {"name": "Refrigeradores", "value": 20000},
    ]
  }

  getTopRatedProducts(): Observable<{ name: string, value: number }[]> {
    const token = localStorage.getItem('token') || '';
    return this.http.get<any>(
      `${this.apiUrl}/productos/top-rating`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      map((resp: any) => resp.productos)
    );
  }
}
