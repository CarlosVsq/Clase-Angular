import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-star',
  imports: [],
  templateUrl: './star.html',
  styleUrl: './star.css',
})
export class Star {
  rating = input<number>(100, { alias: 'rating' });

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
}
