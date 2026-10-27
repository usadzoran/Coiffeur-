import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Scissors, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'حدث خطأ غير متوقع' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Golden Shears app:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center font-sans"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6 shadow-xl">
            <Scissors className="w-8 h-8 rotate-45" />
          </div>

          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">
            صالون المقص الذهبي · بن فريحة وهران
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            مرحباً بك، جارٍ تهيئة منصة الصالون
          </h1>

          <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            تم رصد تحديث في إعدادات المتصفح أو الذاكرة المؤقتة. يمكنك استئناف التصفح فوراً بالضغط على الزر أدناه:
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تحميل المنصة</span>
            </button>

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>استعادة ضبط المصنع</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
