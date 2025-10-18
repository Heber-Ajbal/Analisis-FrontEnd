import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const RECAPTCHA_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

@Component({
  selector: 'app-recaptcha',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RecaptchaComponent),
      multi: true,
    },
  ],
  template: `<div #container class="recaptcha-container"></div>`,
  styles: [
    `:host { display: block; }`,
    `:host(.disabled) { pointer-events: none; opacity: 0.7; }`,
    `.recaptcha-container { min-height: 78px; }`,
  ],
})
export class RecaptchaComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private static loader?: Promise<void>;

  @Input({ required: true }) siteKey!: string;
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() size: 'normal' | 'compact' = 'normal';
  @Output() resolved = new EventEmitter<string>();
  @Output() expired = new EventEmitter<void>();
  @ViewChild('container', { static: true }) private container!: ElementRef<HTMLDivElement>;

  @HostBinding('class.disabled') protected disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private widgetId: number | null = null;
  private value: string | null = null;

  async ngAfterViewInit(): Promise<void> {
    if (!this.siteKey) {
      console.warn('reCAPTCHA: siteKey is required');
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    try {
      await this.ensureScript();
      await this.renderWidget();
    } catch (error) {
      console.error('Failed to initialise reCAPTCHA', error);
    }
  }

  ngOnDestroy(): void {
    this.reset();
  }

  writeValue(value: string | null): void {
    this.value = value ?? null;
    if (!value) {
      this.reset();
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  reset(): void {
    this.value = null;
    if (typeof window === 'undefined') {
      return;
    }
    if (this.widgetId !== null && window.grecaptcha?.reset) {
      window.grecaptcha.reset(this.widgetId);
    }
  }

  private ensureScript(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    if (window.grecaptcha?.render) {
      return this.waitForReady();
    }

    if (!RecaptchaComponent.loader) {
      RecaptchaComponent.loader = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
          'script[src^="https://www.google.com/recaptcha/api.js"]',
        );

        if (existing) {
          if (existing.dataset['loaded'] === 'true' || window.grecaptcha?.render) {
            resolve();
            return;
          }
          existing.addEventListener('load', () => {
            existing.dataset['loaded'] = 'true';
            resolve();
          });
          existing.addEventListener('error', (event) => reject(event));
          return;
        }

        const script = document.createElement('script');
        script.src = RECAPTCHA_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          script.dataset['loaded'] = 'true';
          resolve();
        };
        script.onerror = (event) => reject(event);
        document.head.appendChild(script);
      });
    }

    return RecaptchaComponent.loader.then(() => this.waitForReady());
  }

  private waitForReady(): Promise<void> {
    if (window.grecaptcha?.ready) {
      return new Promise<void>((resolve) => {
        window.grecaptcha.ready(() => resolve());
      });
    }
    return Promise.resolve();
  }

  private async renderWidget(): Promise<void> {
    if (this.widgetId !== null) {
      return;
    }

    const grecaptcha = window.grecaptcha;
    if (!grecaptcha?.render) {
      throw new Error('grecaptcha not available after loading script');
    }

    this.container.nativeElement.innerHTML = '';

    this.widgetId = grecaptcha.render(this.container.nativeElement, {
      sitekey: this.siteKey,
      theme: this.theme,
      size: this.size,
      callback: (token: string) => {
        this.value = token;
        this.onChange(token);
        this.resolved.emit(token);
        this.onTouched();
      },
      'expired-callback': () => {
        this.value = null;
        this.onChange(null);
        this.expired.emit();
      },
      'error-callback': () => {
        this.value = null;
        this.onChange(null);
      },
    });
  }
}
