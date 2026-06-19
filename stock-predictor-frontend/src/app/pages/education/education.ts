import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.html'
})
export class Education {
  topics = [
    { title: 'What is a Stock?', content: 'A stock represents partial ownership in a company. When you buy a share, you own a small piece of that business and may benefit from its growth or be affected by its losses.' },
    { title: 'What is ARIMA?', content: 'ARIMA (AutoRegressive Integrated Moving Average) is a statistical model used to forecast time-series data like stock prices, based on patterns in past values.' },
    { title: 'What is LSTM?', content: 'LSTM (Long Short-Term Memory) is a type of neural network well-suited to sequential data, capable of learning long-term dependencies — useful for capturing trends in stock price movement over time.' },
    { title: 'What is Sentiment Analysis?', content: 'Sentiment analysis uses natural language processing to determine whether news or social media content about a stock is generally positive, negative, or neutral, which can hint at market mood.' },
    { title: 'Risk Disclaimer', content: 'Stock markets are inherently volatile and unpredictable. No model can guarantee future performance. Always do independent research and consult a financial advisor before investing.' }
  ];
}