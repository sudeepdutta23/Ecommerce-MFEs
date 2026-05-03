import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

function bootstrap() {
  const container = document.querySelector('app-root');
  if (!container) {
    console.error('app-root element not found');
    return Promise.reject('app-root not found');
  }
  
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter([]),
      provideAnimations(),
    ]
  }).catch((err) => {
    console.error('Bootstrap error:', err);
    throw err;
  });
}

// Expose bootstrap globally for module federation / shell loading
(window as any).bootstrap = bootstrap;

// Bootstrap when loaded as a standalone app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('app-root')) {
      bootstrap().catch(err => console.error('Failed to bootstrap:', err));
    }
  });
} else if (document.querySelector('app-root')) {
  bootstrap().catch(err => console.error('Failed to bootstrap:', err));
}

// Export for federation
export { bootstrap };
export { AppComponent };
export default bootstrap;

