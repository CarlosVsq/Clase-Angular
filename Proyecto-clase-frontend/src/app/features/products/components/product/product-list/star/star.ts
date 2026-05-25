import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-star',
  imports: [],
  templateUrl: './star.html',
  styleUrl: './star.css',
})
export class Star {
  rating = input<number>(100, { alias: 'rating' });

  //stars = signal(0);
  //arr: number[] = [];

  stars = computed(() => {
    const rating = this.rating();

    if (rating > 0 && rating <= 40) return 1;
    else if (rating > 41 && rating <= 80) return 2;
    else if (rating > 81 && rating <= 120) return 3;
    else if (rating > 121 && rating <= 160) return 4;
    else if (rating > 161 && rating <= 200) return 5;

    return 0;
  });

  arr = computed(() =>
    Array(this.stars()).fill(1)
  );

  /*
  ngOnChanges(): void {
    console.log("hijo star ngOnChanges");
    this.stars.set(this.rating() / 20);
    if (this.rating() > 0 && this.rating() <= 40) {
      this.stars.set(1);
    } else if (this.rating() > 41 && this.rating() <= 80){
      this.stars.set(2);
    } else if (this.rating() > 81 && this.rating() <= 120){
      this.stars.set(3);
    } else if (this.rating() > 121 && this.rating() <= 160){
      this.stars.set(4);
    } else if (this.rating() > 161 && this.rating() <= 200){
      this.stars.set(5);
    }
    this.arr = Array(this.stars()).fill(1);
  }*/
}
