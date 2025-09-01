import {  AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { GifListComponent } from "../../components/gif-list/gif-list.component";
import { GifService } from '../../service/giphy.service';
import { Gif } from '../../interfaces/gif.interface';
import { ScrollStateService } from 'src/app/shared/services/scroll-state.service';

@Component({
  selector: 'app-search-page',
  imports: [GifListComponent],
  templateUrl: './search-page.component.html',
})
export default class SearchPageComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv) return;
  } 
  
  scrollStateService = inject(ScrollStateService)
  scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv');
  
  gifService = inject(GifService);
  gifs = signal<Gif[]>([]);

  onSearch( query: string){
    this.gifService.searchGifs(query).subscribe();
  }
  onScroll(event: Event){
     const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv || !this.gifService.isSearching()) return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeight = scrollDiv.clientHeight;
// en la consola del navegador aparecera información relativa al tamayo de la pantalla
// nos ayudara a determinar cuando hemos llegado al final para poder realizar otra petición
    const scrollHeight = scrollDiv.scrollHeight;
    
    //boleano que cambia cerca del final de la página.
    const isAtBottom = scrollTop + clientHeight + 300 >= scrollHeight;
    //this.scrollStateService.trendingScrollState.set(scrollTop);
    //carga la siguiente página
    if(isAtBottom){
      this.gifService.loadMoreSearchResults();
  }
}
}