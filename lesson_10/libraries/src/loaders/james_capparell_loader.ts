import csv from 'csv-parser';
import fs from 'fs';
import { Credit, MediaItem } from '../models/index.js';
import { Loader } from './loader.js';

export class JamesCapparellLoader implements Loader {
  getLoaderName(): string {
    return 'jamescapparell';
  }

  async loadData(): Promise<MediaItem[]> {
    const credits = await this.loadCredits();
    const mediaItems = await this.loadMediaItems();

    console.log(
      `Loaded ${credits.length} credits and ${mediaItems.length} media items`,
    );
    credits.forEach((credit) => {
      const mediaItem = mediaItems.find(
        (media) => media.getId() === credit.getMediaItemId(),
      );

      if (mediaItem) {
        mediaItem.addCredit(credit);
      }
    });
    return [...mediaItems.values()];
  }

  async loadMediaItems(): Promise<MediaItem[]> {
    const medias = [];
    const readable = fs
      .createReadStream('data/media_items.csv', 'utf-8')
      .pipe(csv());
    for await (const row of readable) {
      const {id, title, type, year } = row;
      medias.push(new MediaItem(id, title, type, year, []));
    }
    return medias;
  }

  async loadCredits(): Promise<Credit[]> {
    const credits = [];
    const readable = fs
      .createReadStream('data/credits.csv', 'utf-8')
      .pipe(csv());
    for await (const row of readable) {
      const { media_item_id, role, name } = row;
      credits.push(new Credit(media_item_id, name, role));
    }
    return credits;
  }
}
