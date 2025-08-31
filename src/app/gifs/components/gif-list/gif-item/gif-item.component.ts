import { Component, input } from '@angular/core';

@Component({
  selector: 'app-gif-item',
  imports: [],
  templateUrl: './gif-item.component.html',
})
export class GifItemComponent {
  imageUrl = input.required<string>();
 }
