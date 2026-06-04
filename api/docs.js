module.exports = async (req, res) => {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const openapiUrl = `${proto}://${host}/api/openapi.json`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Diet Optimization API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: "${openapiUrl}",
          dom_id: "#swagger-ui"
        });
      };
    </script>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
};
