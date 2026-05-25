import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';

import {IProduct} from '../../interfaces/product';
import { Product as ProductService } from '../../services/product';
import { ProductList } from './product-list/product-list';
import { ModalAdd } from './modal-add/modal-add';

@Component({
  selector: 'app-product',
  imports: [
    ModalAdd,
    ProductList,
    FormsModule
  ],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product {
  isModalOpen = signal(false);
  listFilter = signal('');

  constructor(public productService: ProductService){}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products: IProduct[]) => {
      this.productService.products.set(products);
    })
  };

  filteredProducts = computed(() =>
    this.productService.products().filter(p =>
      p.productName.toLowerCase().includes(this.listFilter().toLowerCase())
    )
  );

  abrirModal() {
    console.log('Abriendo modal');
    this.isModalOpen.set(true);
    console.log(this.isModalOpen());
  }

  cerrarModal() {
    console.log('Cerrando modal');
    this.isModalOpen.set(false);
  }

  guardarProducto(product: IProduct) {
    console.log('Guardando producto:', product);
    this.productService.saveProduct(product).pipe(
      switchMap(() => this.productService.getProducts()) 
    ).subscribe(products => this.productService.products.set(products));
  }

  crearProducto() {
    let datos: any = {
      name: `Producto Nuevo ${Math.round(Math.random() * (100 - 1) +1)}`,
      code: this.productService.generateProductCode(),
      date: '2024-01-01',
      price: Math.round(Math.random() * (40000 - 10000) + 10000),
      description: 'Descripción del producto',
      rate: Math.round(Math.random() * (200 - 1) + 1),
      image: 'gamuza_hush.jpg'      
    }
    this.guardarProducto(datos);
  }  
}
