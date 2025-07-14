type ToastType = 'success' | 'error' | 'info';

interface ToastFunction {
  (message: string, type: ToastType, duration?: number): void;
}

class ToastManager {
  private toastFunction: ToastFunction | null = null;
  private pendingToasts: Array<{ message: string; type: ToastType; duration?: number }> = [];

  setToastFunction(toastFunction: ToastFunction) {
    this.toastFunction = toastFunction;
    // Show any pending toasts
    this.pendingToasts.forEach(toast => {
      this.toastFunction!(toast.message, toast.type, toast.duration);
    });
    this.pendingToasts = [];
  }

  showToast(message: string, type: ToastType, duration?: number) {
    if (this.toastFunction) {
      this.toastFunction(message, type, duration);
    } else {
      // Queue the toast to show when toast function becomes available
      this.pendingToasts.push({ message, type, duration });
      // Fallback to alert after a brief delay if toast function doesn't become available
      setTimeout(() => {
        if (!this.toastFunction && this.pendingToasts.some(t => t.message === message)) {
          alert(message);
          this.pendingToasts = this.pendingToasts.filter(t => t.message !== message);
        }
      }, 500);
    }
  }

  success(message: string, duration?: number) {
    this.showToast(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.showToast(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.showToast(message, 'info', duration);
  }
}

export const toastManager = new ToastManager();