import {  AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { GifListComponent } from "../../components/gif-list/gif-list.component";
import { GifService } from '../../service/giphy.service';
import { ScrollStateService } from 'src/app/shared/services/scroll-state.service';

//const imageUrls: string[] = [
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg",
//   "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-6.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-7.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-8.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-9.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-10.jpg",
//    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-11.jpg"
//];

@Component({
  selector: 'app-trending-page',
  imports: [],
  templateUrl: './trending-page.component.html',
})
export default class TrendingPageComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv) return;
    //función para mantener el scroll donde lo dejemos antes de cambiar de página
    scrollDiv.scrollTop = this.scrollStateService.trendingScrollState();
    } 
  //gifs = imageUrls;

  gifService = inject(GifService);
  scrollStateService = inject(ScrollStateService);

  scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv');

  onScroll(event: Event){
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv) return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeight = scrollDiv.clientHeight;
// en la consola del navegador aparecera información relativa al tamayo de la pantalla
// nos ayudara a determinar cuando hemos llegado al final para poder realizar otra petición
    const scrollHeight = scrollDiv.scrollHeight;
    
    //boleano que cambia cerca del final de la página.
    const isAtBottom = scrollTop + clientHeight + 300 >= scrollHeight;
    this.scrollStateService.trendingScrollState.set(scrollTop);
    //carga la siguiente página
    if(isAtBottom){
      this.gifService.loadTrendingGifs();
    }


  }

  
}
