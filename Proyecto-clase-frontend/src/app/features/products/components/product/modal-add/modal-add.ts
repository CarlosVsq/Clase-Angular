import { Component, output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-add',
  imports: [ReactiveFormsModule],
  templateUrl: './modal-add.html',
  styleUrl: './modal-add.css',
})
export class ModalAdd {
  close = output<void>();
  private fb = inject(FormBuilder);

  formProduct = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    date: ['', Validators.required],
    price: [0, Validators.required],
    description: ['', Validators.required],
    rating: [0, [Validators.required, Validators.min(0), Validators.max(200)]]
  })

  saveData() {
    console.log('Guardando producto:', this.formProduct.value);
  }

  ocultarModal() {
    this.close.emit();
  }



}
