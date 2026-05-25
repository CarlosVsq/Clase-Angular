import { Component, input, output } from '@angular/core';
import { DatePipe, UpperCasePipe, LowerCasePipe, CurrencyPipe } from '@angular/common';
import { ImagePipe } from '../../../../../shared/image-pipe';
import { IProduct } from '../../../interfaces/product';
import { Star } from './star/star';
import { Product } from '../../../services/product';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  imports: [Star, DatePipe, ImagePipe, UpperCasePipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  
  constructor(private productService: Product) {}

  ngOnInit(): void {
    console.log('Hijo: ngOnInit');
  }

  ngOnChanges(): void {
    console.log('Hijo: ngOnChanges');
  }

  ngOnDestroy(): void {
    console.log('Hijo: ngOnDestroy');
  }

  products = input<IProduct[]>([], { alias: 'datos'});
  updatedProducts = output<IProduct[]>();
  imageWidth: number = 50;
  imageHeight: number = 50;
  imageMargin: number = 10;
  showImage: boolean =false;

  toggleImage():void {
    this.showImage = !this.showImage;
  }

  deleteProduct(productId: number) {
    console.log('Borrando producto:', productId);
    this.productService.deleteProduct(productId).pipe(
      switchMap(() => this.productService.getProducts())
    ).subscribe({
      next: (products: IProduct[]) => {
        console.log('Llegó un dato');
        console.log('Producto eliminado:', productId);
        this.updatedProducts.emit(products);
      },
      error: (error: any) => {
        console.error('Error al borrar el producto:', error);
      },
      complete: () => console.log('Eliminación de producto completada')
    });
  }

  editProduct(productId: number, product: IProduct) {
    let datos: any = {
      name: `Producto Actualizado ${Math.round(Math.random() * (100 - 1) +1)}`,
      code: this.productService.generateProductCode(),
      date: '2024-01-01',
      price: Math.round(Math.random() * (40000 - 10000)),
      description: 'Descripción del producto nuevo',
      rate: Math.round(Math.random() * (200 - 1) +1),
      image: 'gamuza_hush.jpg'
    }

    this.productService.updateProduct(productId, datos).pipe(
      switchMap(() => this.productService.getProducts())
    ).subscribe({
      next: (products: IProduct[]) => {
        console.log('Llegó un dato');
        console.log('Producto actualizado:', productId);
        this.updatedProducts.emit(products);
      },
      error: (error: any) => {
        console.error('Error al actualizar el producto:', error);
      },
      complete: () => console.log('Actualización de producto completada')
    });
  }
}

