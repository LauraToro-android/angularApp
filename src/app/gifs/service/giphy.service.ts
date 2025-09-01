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

@Injectable({ providedIn: 'root' })
export class GifService {

    private http = inject(HttpClient);

    // 🟣 Trending
    trendingGifs = signal<Gif[]>([]);
    trendingGifsLoading = signal(false);
    private trendingPage = signal(0);

    trendingGifGroup = computed<Gif[][]>(() => {
        const groups = [];
        for (let i = 0; i < this.trendingGifs().length; i += 3) {
            groups.push(this.trendingGifs().slice(i, i + 3));
        }
        return groups;
    });

    // 🔍 Historial
    searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
    searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

    // ✅ NUEVO: Scroll infinito de búsqueda
    private searchQuery = signal('');
    private searchPage = signal(0);
    private searchResults = signal<Gif[]>([]);
    private searchLoading = signal(false);

    // Agrupado de resultados de búsqueda
    searchGifGroup = computed<Gif[][]>(() => {
        const groups: Gif[][] = [];
        const gifs = this.searchResults();
        for (let i = 0; i < gifs.length; i += 3) {
            groups.push(gifs.slice(i, i + 3));
        }
        return groups;
    });

    isSearching = computed(() => this.searchQuery().trim().length > 0);
    searchLoadingState = computed(() => this.searchLoading());

    constructor() {
        this.loadTrendingGifs();
        console.log('Servicio creado');

        // Guardar historial en localStorage
        effect(() => {
            const historyString = JSON.stringify(this.searchHistory());
            localStorage.setItem(GIF_KEY, historyString);
        });
    }

    loadTrendingGifs() {
        if (this.trendingGifsLoading()) return;

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
            this.trendingPage.update((page) => page + 1);
            this.trendingGifsLoading.set(false);
        });
    }

    searchGifs(query: string): Observable<Gif[]> {
        // ✅ Nueva búsqueda
        this.searchQuery.set(query);
        this.searchPage.set(1); // Página 1, la siguiente será 2
        this.searchLoading.set(true);

        return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
            params: {
                api_key: environment.apiKey,
                limit: 20,
                q: query,
                offset: 0
            },
        }).pipe(
            map(({ data }) => GifMapper.mapGiphyItemsToGifArray(data)),
            tap(items => {
                this.searchResults.set(items);
                this.searchHistory.update(history => ({
                    ...history,
                    [query.toLowerCase()]: items,
                }));
                this.searchLoading.set(false);
            })
        );
    }

    // ✅ NUEVO: Scroll infinito en búsqueda
    loadMoreSearchResults() {
        if (this.searchLoading()) return;
        const query = this.searchQuery();
        if (!query) return;

        this.searchLoading.set(true);

        const offset = this.searchPage() * 20;

        this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
            params: {
                api_key: environment.apiKey,
                limit: 20,
                q: query,
                offset: offset
            }
        }).pipe(
            map(resp => GifMapper.mapGiphyItemsToGifArray(resp.data)),
            tap(newGifs => {
                this.searchResults.update(current => [...current, ...newGifs]);
                this.searchPage.update(page => page + 1);
                this.searchLoading.set(false);
            })
        ).subscribe();
    }

    getHistoryGifs(query: string): Gif[] {
        return this.searchHistory()[query.toLowerCase()] ?? [];
    }
}
