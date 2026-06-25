import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Topic {
  title: string;
  content: string;
  expanded?: boolean;
}

interface Category {
  name: string;
  icon: string;
  topics: Topic[];
}

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.html'
})
export class Education implements OnInit {
  accuracySummary: any[] = [];

  categories: Category[] = [
    {
      name: 'Stock Market Basics',
      icon: '📘',
      topics: [
        {
          title: 'What is a Stock?',
          content: 'A stock represents partial ownership in a company. When you buy a share, you own a small piece of that business and may benefit from its growth (price appreciation, dividends) or be affected by its losses.'
        },
        {
          title: 'What is a Stock Exchange?',
          content: 'A stock exchange (like NASDAQ or NSE) is a regulated marketplace where buyers and sellers trade shares of publicly listed companies. Prices move based on supply and demand, driven by company performance, news, and investor sentiment.'
        },
        {
          title: 'What Moves Stock Prices?',
          content: 'Prices are influenced by company earnings, economic indicators, interest rates, geopolitical events, industry trends, and overall market sentiment — both rational (financial fundamentals) and emotional (fear, hype) factors play a role.'
        }
      ]
    },
    {
      name: 'Prediction Algorithms',
      icon: '🤖',
      topics: [
        {
          title: 'What is ARIMA?',
          content: 'ARIMA (AutoRegressive Integrated Moving Average) is a classical statistical model for time-series forecasting. It looks at a stock\'s own past values and past forecast errors to predict future prices. It works well for short-term trends but assumes the underlying pattern stays statistically stable, which is often not true for volatile stocks.'
        },
        {
          title: 'What is LSTM?',
          content: 'LSTM (Long Short-Term Memory) is a deep learning architecture (a type of recurrent neural network) designed to learn patterns across long sequences of data. Unlike ARIMA, it can capture more complex, non-linear relationships in price movement, but it needs more data and computation time to train.'
        },
        {
          title: 'What is Linear Regression (in this context)?',
          content: 'Here, Linear Regression fits a straight-line trend to recent closing prices and extends that line forward. It\'s the simplest of the three models — fast and easy to interpret, but it can\'t capture sudden reversals or cyclical patterns the way ARIMA or LSTM can.'
        },
        {
          title: 'Why Combine Multiple Models? (Ensemble Forecasting)',
          content: 'Each algorithm has different strengths and blind spots. By combining their forecasts — weighted by how accurate each has been historically (using RMSE) — an ensemble forecast often performs more reliably than relying on any single model alone.'
        },
        {
          title: 'What is RMSE?',
          content: 'RMSE (Root Mean Squared Error) measures how far off a model\'s past predictions were from actual prices, on average. A lower RMSE means the model has historically been more accurate for that specific stock — which is why we display it next to each model\'s forecast.'
        }
      ]
    },
    {
      name: 'Sentiment & News',
      icon: '📰',
      topics: [
        {
          title: 'What is Sentiment Analysis?',
          content: 'Sentiment analysis uses natural language processing to determine whether news coverage about a stock is generally positive, negative, or neutral. Markets often react to narrative and perception as much as to hard numbers, so sentiment can be a useful early signal.'
        },
        {
          title: 'Why Combine Sentiment with Price Forecasts?',
          content: 'Pure price-based models can miss sudden shifts driven by news events (earnings surprises, leadership changes, regulatory action). Blending sentiment with quantitative forecasts gives a more rounded picture — though sentiment alone is noisy and shouldn\'t be the sole basis for any decision.'
        }
      ]
    },
    {
      name: 'Risk & Strategy',
      icon: '⚠️',
      topics: [
        {
          title: 'No Model is Perfect',
          content: 'Stock markets are influenced by countless unpredictable factors — no algorithm, however sophisticated, can guarantee future performance. Treat forecasts as one input among many, not a certainty.'
        },
        {
          title: 'Diversification',
          content: 'Spreading investments across multiple stocks, sectors, or asset classes reduces the impact of any single stock performing poorly. It\'s one of the most fundamental risk-management principles in investing.'
        },
        {
          title: 'Volatility',
          content: 'Volatility measures how much a stock\'s price fluctuates over time. Highly volatile stocks can offer larger gains but also larger losses — understanding a stock\'s volatility helps set realistic expectations for any forecast.'
        },
        {
          title: 'Risk Disclaimer',
          content: 'This platform is built for educational purposes. Predictions are based on historical patterns and public sentiment data, and may not reflect actual future market movement. Always do independent research and consult a qualified financial advisor before making investment decisions.'
        }
      ]
    }
  ];

  glossary: { term: string; definition: string }[] = [
    { term: 'Ticker', definition: 'A unique series of letters assigned to a publicly traded company\'s shares (e.g. AAPL for Apple).' },
    { term: 'Close Price', definition: 'The final price a stock traded at when the market closed for the day.' },
    { term: 'Volume', definition: 'The total number of shares traded during a given period.' },
    { term: 'Bull Market', definition: 'A market condition where prices are generally rising or expected to rise.' },
    { term: 'Bear Market', definition: 'A market condition where prices are generally falling or expected to fall.' },
    { term: 'Forecast Horizon', definition: 'The future time period a prediction covers — in this app, the next 7 days.' },
    { term: 'Backtesting', definition: 'Testing a model\'s predictions against historical data to evaluate how accurate it would have been.' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/api/accuracy/summary`).subscribe({
      next: (res) => { this.accuracySummary = res.summary || []; },
      error: () => {}
    });
  }

  toggle(topic: Topic) {
    topic.expanded = !topic.expanded;
  }
}