<div align="center">
  <h1> VSCode Extension: OpenAPI Docs Viewer</h1>
  <strong>Display interactive OpenAPI schema documentation in VSCode</strong>
</div>

<br /><br />

![Overview](docs/images/overview.gif)

## Features

Enter any OpenAPI schema URL and view the documentation in a VSCode tab. You can customize the schema renderer and theme.

### Supported Renderers

<details>
  <summary><strong>Elements (Default)</strong></summary>

  Build beautiful, interactive API Docs with embeddable React or Web Components, powered by OpenAPI and Markdown.
  https://github.com/stoplightio/elements

  **Preview**
  <table>
    <tr>
      <td><strong>Theme</strong></td>
      <td><strong>Layout: Mobile</strong></td>
      <td><strong>Layout: Desktop</storng></td>
    </tr>
    <tr>
      <td>Dark</td>
      <td><img src="docs/images/theme-elements-dark-small.png" alt="Elements Dark Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-dark-large.png" alt="Elements Dark Theme: Large" width="600"/></td>
    </tr>
    <tr>
      <td>Light</td>
      <td><img src="docs/images/theme-elements-light-small.png" alt="Elements Light Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-elements-light-large.png" alt="Elements Light Theme: Large" width="600"/></td>
    </tr>
  </table>
</details>
<details>
  <summary><strong>RapiDoc</strong></summary>

  Custom Element for Open-API spec viewing  
  https://github.com/rapi-doc/RapiDoc

  **Preview**
  <table>
    <tr>
      <td><strong>Theme</strong></td>
      <td><strong>Layout: Mobile</strong></td>
      <td><strong>Layout: Desktop</storng></td>
    </tr>
    <tr>
      <td>Dark</td>
      <td><img src="docs/images/theme-rapidoc-dark-small.png" alt="RapiDoc Dark Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-rapidoc-dark-large.png" alt="RapiDoc Dark Theme: Large" width="600"/></td>
    </tr>
    <tr>
      <td>Light</td>
      <td><img src="docs/images/theme-rapidoc-light-small.png" alt="RapiDoc Light Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-rapidoc-light-large.png" alt="RapiDoc Light Theme: Large" width="600"/></td>
    </tr>
  </table>
</details>
<details>
  <summary><strong>ReDoc</strong></summary>

  OpenAPI/Swagger-generated API Reference Documentation  
  https://github.com/Redocly/redoc

  **Preview**
  <table>
    <tr>
      <td><strong>Theme</strong></td>
      <td><strong>Layout: Mobile</strong></td>
      <td><strong>Layout: Desktop</storng></td>
    </tr>
    <tr>
      <td>Dark</td>
      <td><img src="docs/images/theme-redoc-dark-small.png" alt="Redoc Dark Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-redoc-dark-large.png" alt="Redoc Dark Theme: Large" width="600"/></td>
    </tr>
    <tr>
      <td>Light</td>
      <td><img src="docs/images/theme-redoc-light-small.png" alt="Redoc Light Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-redoc-light-large.png" alt="Redoc Light Theme: Large" width="600"/></td>
    </tr>
  </table>
</details>
<details>
  <summary><strong>Swagger</strong></summary>

  Swagger UI is a collection of HTML, JavaScript, and CSS assets that dynamically generate beautiful documentation from a Swagger-compliant API.  
  https://github.com/swagger-api/swagger-ui

  **Preview**
  <table>
    <tr>
      <td><strong>Theme</strong></td>
      <td><strong>Layout: Mobile</strong></td>
      <td><strong>Layout: Desktop</storng></td>
    </tr>
    <tr>
      <td>Dark</td>
      <td><img src="docs/images/theme-swagger-dark-small.png" alt="Swagger Dark Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-swagger-dark-large.png" alt="Swagger Dark Theme: Large" width="600"/></td>
    </tr>
    <tr>
      <td>Light</td>
      <td><img src="docs/images/theme-swagger-light-small.png" alt="Swagger Light Theme: Small" width="300"/></td>
      <td><img src="docs/images/theme-swagger-light-large.png" alt="Swagger Light Theme: Large" width="600"/></td>
    </tr>
  </table>
</details>

### Themes

**Supported Themes**: `system`, `light`, `dark`  
**Default Theme**: `system`

By default, the extension will use the system theme. System theme adopts the color scheme of the current VSCode theme. If you want to override the system theme, you can set the `openapi-docs-viewer.defaultTheme` setting to `dark` or `light`.

## Extension Settings

This extension contributes the following settings:

* `openapi-docs-viewer.defaultRenderer`: Set the default theme for the OpenAPI viewer, default is `elements`.
* `openapi-docs-viewer.defaultTheme`: Set the default color scheme, default is `system`.
