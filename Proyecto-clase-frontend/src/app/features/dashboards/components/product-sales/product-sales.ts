import { Component, inject, signal } from '@angular/core';
import { ProductSalesAnalytics } from '../../services/product-sales-analytics';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-product-sales',
  imports: [NgxChartsModule],
  templateUrl: './product-sales.html',
  styleUrl: './product-sales.css',
})
export class ProductSales {
  colorScheme: any = {
    domain: ['#1565C0', '#03A0F4', '#FFA726', "#FFCC80", '#FFA07A']
  }

  productSalesAnalytics = inject(ProductSalesAnalytics);
  saleData = signal<{name: string, value: number}[]>([]);
  topRatedData = signal<{name: string, value: number}[]>([]);

  ngOnInit() {
    this.saleData.set(this.productSalesAnalytics.getSales());

    this.productSalesAnalytics.getTopRatedProducts().subscribe({
      next: (data) => this.topRatedData.set(data),
      error: (err) => console.error('Error al obtener el top de productos:', err)
    });
  }
}
