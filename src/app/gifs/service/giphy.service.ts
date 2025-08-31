import { HttpClient } from "@angular/common/http";
import { computed, effect, Injectable, signal } from "@angular/core";
import { inject } from "@angular/core/primitives/di";
import { environment } from "@environments/environment";
import { GiphyResponse } from "../interfaces/giphy.interfaces";
import { Gif } from "../interfaces/gif.interface";
import { GifMapper } from "../mapper/gif.mapper";
import { map, Observable, tap } from "rxjs";

const GIF_KEY = 'gifs';

const loadFromLocalStorage = () => {
    const gifsFromLocalStorage = localStorage.getItem(GIF_KEY) ?? '{}';
    const gifs = JSON.parse(gifsFromLocalStorage);
    console.log(gifs);
    return gifs;
}

@Injectable({providedIn: 'root'})
export class GifService {

    private http = inject(HttpClient);

    trendingGifs = signal<Gif[]>([]);
    trendingGifsLoading = signal(false);
    private trendingPage = signal(0);

    //[[gif, gif, gif],[gif, gif, gif],[gif, gif, gif]]
    // Un array dentro de otro array para agrupar y ordenar y crear grupos de tres en tres
    trendingGifGroup = computed<Gif[][]>(() =>{
        const groups = [];
        for( let i = 0;i < this.trendingGifs().length; i+=3){
            groups.push(this.trendingGifs().slice(i, i +3));
        }
        console.log(groups);
        return groups;
    })

    searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
    searchHistoryKeys = computed(() => Object.keys(this.searchHistory()))

    constructor() {
        this.loadTrendingGifs();
        console.log('Servcio creado');
    }

    saveGifsToLocalStorage = effect(() => {
        const historiString = JSON.stringify(this.searchHistory());
        localStorage.setItem('gifs', historiString);

    })

    loadTrendingGifs(){
        // Evitar el bonbardeo de las peticiones que estan creadas.
        if (this.trendingGifsLoading()) return; 
        //si no esta utilizando esta función la activamos otra vez para que la pagina siga 
        this.trendingGifsLoading.set(true);

        this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
            params: {
                api_key: environment.apiKey,
                limit: 20,
                offset: this.trendingPage() * 20,

            },
        }).subscribe((resp) => {
            const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
            this.trendingGifs.update(currentGifs => [
                ...currentGifs,
                ...gifs,
            ]);
            this.trendingPage.update((page) => page +1);//Pagina infinita lista infinita
            this.trendingGifsLoading.set(false);
            console.log({gifs});
        });
    }

    searchGifs(query: string): Observable<Gif[]>{
        return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
            params: {
                api_key: environment.apiKey,
                limit: 20,
                q: query,

            },
        }).pipe(
            map(({data}) => data),
            map((items) => GifMapper.mapGiphyItemsToGifArray(items)),

            tap(items => {
                this.searchHistory.update( history => ({
                    ...history,
                    [query.toLowerCase()]: items,
                }));
            })

        )
        //.subscribe((resp) => {
        //    const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
            //console.log({search: gifs});
        //});

    }
    getHistoryGifs(query: string): Gif[] {
        return this.searchHistory()[query]?? [];

    }
}