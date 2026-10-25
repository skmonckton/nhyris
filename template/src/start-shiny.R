# Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn

# Script that starts the shiny webserver
# Parameters are supplied using environment variables
assign(".lib.loc", Sys.getenv("R_LIB_PATHS"), envir = environment(.libPaths))

# Electron use 1124 port
# so Shiny should not use 1124 port
## Nope, this is not needed 250506

# Check if 'shiny' package is installed in R_LIB_PATHS
r_lib_paths <- Sys.getenv("R_LIB_PATHS")

if (!nzchar(r_lib_paths)) {
  stop("R_LIB_PATHS is not available. Please set the correct library path.")
}

.libPaths(r_lib_paths) # Temporarily set library paths to R_LIB_PATHS

if (!requireNamespace("shiny", quietly = TRUE)) {
  stop("The 'shiny' package is not installed in R_LIB_PATHS: ", r_lib_paths)
}
shiny_dir <- Sys.getenv("RE_SHINY_PATH")

# Only the app's own window may use this server. Other pages in the user's browser can reach 127.0.0.1 too, so
# Electron sends a per-launch secret with the window's requests (src/index.js); sessions without it, or with
# another site's Host or Origin header, are closed before the app's server function runs. Without a secret (running
# this script outside Electron) all sessions are allowed.
launch_token <- Sys.getenv("NHYRIS_LAUNCH_TOKEN")
session_authorized <- function(request) {
  if (!nzchar(launch_token)) return(TRUE)
  local_url <- "^(http://)?(127\\.0\\.0\\.1|localhost)(:[0-9]+)?$"
  host <- if (is.null(request$HTTP_HOST)) "" else request$HTTP_HOST
  origin <- if (is.null(request$HTTP_ORIGIN)) "" else request$HTTP_ORIGIN
  token <- if (is.null(request$HTTP_X_NHYRIS_TOKEN)) "" else request$HTTP_X_NHYRIS_TOKEN
  grepl(local_url, host) && (origin == "" || grepl(local_url, origin)) && identical(token, launch_token)
}

# the app's server function is wrapped with the check, so apps don't need any changes for it
app <- shiny::shinyAppDir(shiny_dir)
app_server_source <- app$serverFuncSource
app$serverFuncSource <- function() {
  server <- app_server_source()
  function(input, output, session) {
    if (!session_authorized(session$request)) {
      session$close()
      return(invisible(NULL))
    }
    if ("session" %in% names(formals(server)) || length(formals(server)) >= 3) {
      server(input = input, output = output, session = session)
    } else {
      server(input = input, output = output)
    }
  }
}

shiny::runApp(
  app,
  host = "127.0.0.1",
  launch.browser = FALSE,
  port = as.integer(Sys.getenv("RE_SHINY_PORT", unset = "1124"))
)
