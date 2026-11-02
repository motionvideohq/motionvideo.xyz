import { useLocation } from "@tanstack/react-router";

import { motionModelSlug } from "@/lib/motion-catalog";
import type { GalleryScope, GallerySearch } from "@/lib/motion-catalog";

export interface VideoGalleryContext {
  scope?: GalleryScope;
  search: GallerySearch;
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    videoGallery?: VideoGalleryContext;
  }
}

// History state keeps the background collection out of the video's public URL.
export const useVideoGalleryContext = () =>
  useLocation({ select: (location) => location.state.videoGallery });

export const galleryDestination = (scope: GalleryScope | undefined) => {
  switch (scope?.kind) {
    case "category": {
      return {
        to: "/category/$category",
        params: { category: scope.category },
      };
    }
    case "color": {
      return { to: "/color/$color", params: { color: scope.color.slug } };
    }
    case "model": {
      return {
        to: "/model/$model",
        params: { model: motionModelSlug(scope.model) },
      };
    }
    case "type": {
      return { to: "/type/$type", params: { type: scope.type } };
    }
    case "creator": {
      return { to: "/creators/$creator", params: { creator: scope.creator } };
    }
    default: {
      return { to: "/" };
    }
  }
};
