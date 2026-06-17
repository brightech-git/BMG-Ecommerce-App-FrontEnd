// app/utils/commerceFeedback.ts
// Centralised toast + login-redirect handling for cart/wishlist actions so every
// screen gives consistent feedback. `toast` is the object from useToast().
type Toast = { success: (t: string) => void; error: (t: string) => void; info: (t: string) => void };

export const notifyCart = (status: string, toast: Toast, onLogin: () => void) => {
  switch (status) {
    case 'unauth':    toast.info('Please login to add items to your cart'); onLogin(); break;
    case 'invalid':   toast.error('This product is unavailable right now'); break;
    case 'duplicate': toast.info('Already in your cart'); break;
    case 'ok':        toast.success('Added to cart'); break;
  }
  return status;
};

export const notifyWishlist = (status: string, toast: Toast, onLogin: () => void) => {
  switch (status) {
    case 'unauth':  toast.info('Please login to save favourites'); onLogin(); break;
    case 'invalid': toast.error('This product is unavailable right now'); break;
    case 'added':   toast.success('Added to wishlist'); break;
    case 'removed': toast.info('Removed from wishlist'); break;
  }
  return status;
};
