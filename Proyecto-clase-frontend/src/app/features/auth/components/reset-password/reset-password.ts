import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  step = signal<1 | 2>(1);
  mensaje = signal<string>('');
  loading = signal<boolean>(false);

  emailForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetForm = this.formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    password: ['', [Validators.required, Validators.minLength(10)]],
  });

  requestCode(){
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    let email: any = this.emailForm.value.email;
    this.loading.set(true);
    this.authService.requestResetCode(email).subscribe({
      next: (resp: any) => {
        this.loading.set(false);
        this.mensaje.set(resp.mensaje);
        this.step.set(2);
      },
      error: (err) => {
        this.loading.set(false);
        this.mensaje.set(err.error?.mensaje || 'No se pudo enviar el código');
      }
    });
  }

  resetPassword(){
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    let code: any = this.resetForm.value.code;
    let password: any = this.resetForm.value.password;
    this.loading.set(true);
    this.authService.resetPassword(code, password).subscribe({
      next: (resp: any) => {
        this.loading.set(false);
        this.mensaje.set(resp.mensaje);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.mensaje.set(err.error?.mensaje || 'No se pudo actualizar la contraseña');
      }
    });
  }
}
