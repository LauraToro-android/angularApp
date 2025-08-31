import { Component, input } from '@angular/core';
import { GifItemComponent } from "./gif-item/gif-item.component";
import { Gif } from '../../interfaces/gif.interface';

@Component({
  selector: 'app-gif-list',
  imports: [GifItemComponent],
  templateUrl: './gif-list.component.html',
  
})
export class GifListComponent { 
  gifs = input.required<Gif[]>();
}
