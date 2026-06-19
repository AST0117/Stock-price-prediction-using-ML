import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currency-converter.html'
})
export class CurrencyConverter implements OnInit {
  currencies: { [key: string]: string } = {};
  amount = 100;
  from = 'USD';
  to = 'INR';
  result: any = null;
  error = '';

  constructor(private currencyService: CurrencyService) {}

  ngOnInit() {
    this.currencyService.listCurrencies().subscribe({
      next: (res) => { this.currencies = res; },
      error: () => {}
    });
  }

  convert() {
    this.error = '';
    this.currencyService.convert(this.amount, this.from, this.to).subscribe({
      next: (res) => { this.result = res; },
      error: (err) => { this.error = err.error?.error || 'Conversion failed.'; }
    });
  }
}