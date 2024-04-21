<div align="center">
  <h1> VSCode Extension: OpenAPI Docs Viewer</h1>
  <p>Display interactive OpenAPI schema documentation in VSCode</p>
</div>

<br /><br />

![Overview](docs/images/overview.gif)

## Features

Enter any OpenAPI schema URL and view the documentation in a VSCode tab.

### Supported Renderers

<details>
  <summary>Elements (default)</summary>

  **Preview**
  <table>
    <tr>
      <td><img src="docs/images/theme-elements-dark-small.png" alt="Elements Dark Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-dark-large.png" alt="Elements Dark Theme: Large" width="600"/></td>
    </tr>
    <tr>
      <td><img src="docs/images/theme-elements-light-small.png" alt="Elements Light Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-light-large.png" alt="Elements Light Theme: Large" width="600"/></td>
    </tr>
  </table>
</details>
<details>
  <summary>Rapidoc</summary>

  **Preview**
  <table>
    <tr>
      <td><img src="docs/images/theme-elements-dark-small.png" alt="Elements Dark Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-dark-large.png" alt="Elements Dark Theme: Large" width="600"/></td>
    </tr>
    <tr>
      <td><img src="docs/images/theme-elements-light-small.png" alt="Elements Light Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-light-large.png" alt="Elements Light Theme: Large" width="600"/></td>
    </tr>
  </table>
  ![rapidoc Dark Theme: Small](docs/images/theme-rapidoc-dark-small.png)
  ![rapidoc Dark Theme: Large](docs/images/theme-rapidoc-dark-large.png)
  ![rapidoc Light Theme: Small](docs/images/theme-rapidoc-light-small.png)
  ![rapidoc Light Theme: Large](docs/images/theme-rapidoc-light-large.png)
</details>
<details>
  <summary>Redoc</summary>

  **Preview**
  <table>
    <tr>
      <td><img src="docs/images/theme-elements-dark-small.png" alt="Elements Dark Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-dark-large.png" alt="Elements Dark Theme: Large" width="600"/></td>
    </tr>
    <tr>
      <td><img src="docs/images/theme-elements-light-small.png" alt="Elements Light Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-light-large.png" alt="Elements Light Theme: Large" width="600"/></td>
    </tr>
  </table>
  ![redoc Dark Theme: Small](docs/images/theme-redoc-dark-small.png)
  ![redoc Dark Theme: Large](docs/images/theme-redoc-dark-large.png)
  ![redoc Light Theme: Small](docs/images/theme-redoc-light-small.png)
  ![redoc Light Theme: Large](docs/images/theme-redoc-light-large.png)
</details>
<details>
  <summary>Swagger</summary>

  **Preview**
  <table>
    <tr>
      <td><img src="docs/images/theme-elements-dark-small.png" alt="Elements Dark Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-dark-large.png" alt="Elements Dark Theme: Large" width="600"/></td>
    </tr>
    <tr>
      <td><img src="docs/images/theme-elements-light-small.png" alt="Elements Light Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-light-large.png" alt="Elements Light Theme: Large" width="600"/></td>
    </tr>
  </table>
  ![swagger Dark Theme: Small](docs/images/theme-swagger-dark-small.png)
  ![swagger Dark Theme: Large](docs/images/theme-swagger-dark-large.png)
  ![swagger Light Theme: Small](docs/images/theme-swagger-light-small.png)
  ![swagger Light Theme: Large](docs/images/theme-swagger-light-large.png)
</details>

### Dark Mode Support

By default, the extension will use the system theme. System theme adopts the color scheme of the VSCode theme. If you want to override the system theme, you can set the `openapi-docs-viewer.defaultTheme` setting to `dark` or `light`.

## Extension Settings

This extension contributes the following settings:

* `openapi-docs-viewer.defaultRenderer`: Set the default theme for the OpenAPI viewer, default is `elements`.
* `openapi-docs-viewer.defaultTheme`: Set the default color scheme, default is `system`.
