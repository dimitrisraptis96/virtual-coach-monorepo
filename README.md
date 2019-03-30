# gym-buddy

**Live URL:** https://flex-your-muscle.netlify.com/ 

## How to use

Create the WebView and setup the url:

```java
  final String PUBLIC_URL = "https://flex-your-muscle.netlify.com/";
  
  private WebView mWebView = null;
  
  protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      setContentView(R.layout.activity_main);

      mWebView = (WebView) findViewById(R.id.webview);
      mWebView.loadUrl(PUBLIC_URL);

      WebSettings webSettings = mWebView.getSettings();
      webSettings.setJavaScriptEnabled(true);
  }
 ```

When the sample is available call the magical js function

```java
double x = something;
double y = something;
double z = something;
double w = something;

mWebView.evaluateJavascript("javascript: " + "updateQuaternion(" + x + "," + y + "," + z + "," + w + ")", null);
```

Enjoy your workout 🏃
