import {  AfterViewInit, Component, computed, effect, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GifService } from '../../service/giphy.service';
import { GifListComponent } from "../../components/gif-list/gif-list.component";
import { ScrollStateService } from 'src/app/shared/services/scroll-state.service';
import { Gif } from '../../interfaces/gif.interface';

@Component({
  selector: 'app-gif-history',
  imports: [GifListComponent],
  templateUrl: './gif-history.component.html',
})
export default class GifHistoryComponent implements AfterViewInit{
  ngAfterViewInit(): void {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv) return;
    //función para mantener el scroll donde lo dejemos antes de cambiar de página
    scrollDiv.scrollTop = this.scrollStateService.trendingScrollState();
    } 
  

  
  gifService = inject(GifService)
  scrollStateService = inject(ScrollStateService);
  scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv');

  


  query = toSignal(inject(ActivatedRoute).params.pipe(
    map((params) => params['query'])
  ));
  constructor(){
    effect(()=> {
      const query = this.query()?.toLowerCase();
      if (query){
        this.gifService.searchGifs(query).subscribe();
      }
    })
  }

  gifsByKey = computed(() =>{
    const query = this.query()?.toLowerCase();
    const gifs = this.gifService.getHistoryGifs(query);
    const groups: Gif[][] = [];
    for(let i = 0; i < gifs.length; i += 3){
      groups.push(gifs.slice(i, i + 3))
    }
    return groups;
  });

  onScroll(event: Event){
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv) return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeight = scrollDiv.clientHeight;
// en la consola del navegador aparecera información relativa al tamayo de la pantalla
// nos ayudara a determinar cuando hemos llegado al final para poder realizar otra petición
    const scrollHeight = scrollDiv.scrollHeight;
    
    //boleano que cambia cerca del final de la página.
    const isAtBottom = scrollTop + clientHeight + 400 >= scrollHeight;
    this.scrollStateService.trendingScrollState.set(scrollTop);
    //carga la siguiente página
    if(isAtBottom){
      this.gifService.loadMoreSearchResults();
    }


  }
  
}


