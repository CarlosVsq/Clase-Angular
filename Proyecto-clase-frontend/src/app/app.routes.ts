import { Routes } from '@angular/router';

import { Product } from './features/products/components/product/product';
import { Welcome } from './features/home/welcome/welcome';
import { PageNotFound } from './features/not-found/page-not-found/page-not-found';
import { Login } from './features/auth/components/login/login';
import { ResetPassword } from './features/auth/components/reset-password/reset-password';

import { loginGuard } from './features/auth/guards/login-guard';

import { Number } from './features/numbers/components/number/number';
import{ User } from './features/users/components/user/user';
import{ ProductPagination } from './features/products/components/product-pagination/product-pagination';

import{ Map } from './features/maps/components/map/map';

import { ProductSales} from './features/dashboards/components/product-sales/product-sales';

export const routes: Routes = [
    { path: 'home', component: Welcome, canActivate: [loginGuard] },
    { path: 'maps', component: Map, canActivate: [loginGuard] },
    { path: 'products', component: Product, canActivate: [loginGuard] },
    { path: 'product-sales', component: ProductSales, canActivate: [loginGuard] },
    { path: 'products-pagination', component: ProductPagination, canActivate: [loginGuard] },
    { path: 'numbers', component: Number, canActivate: [loginGuard] },
    { path: 'users', component: User, canActivate: [loginGuard] },
    { path: 'login', component: Login },
    { path: 'reset-password', component: ResetPassword },

    { path: '', redirectTo: 'home', pathMatch: 'full' },

    { path: '**', component: PageNotFound }
];
