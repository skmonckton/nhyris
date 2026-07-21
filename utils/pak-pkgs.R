# Original code: Copyright (c) 2025 Jinhwan Kim
# Modified by Spencer K. Monckton

# Script to install R packages with pak

library_path <- file.path("r-nhyris", "library")
dir.create(library_path, showWarnings = FALSE, recursive = TRUE)
.libPaths(library_path)
options(repos = if (.Platform$OS.type == "unix" && Sys.info()["sysname"] == "Linux") {
    c(
        "https://packagemanager.posit.co/cran/__linux__/noble/latest",
        "https://cloud.r-project.org"
    )
} else {
    "https://cloud.r-project.org"
})

# assumes pak package is not installed with r-local
suppressMessages(suppressWarnings(
  install.packages(c("pak", "formatR"), lib = library_path, quiet = TRUE)
))

library(pak, lib.loc = library_path)

# Check if 'shiny' directory exists and contains R files
if (!dir.exists("shiny")) {
    stop("The 'shiny' directory does not exist at path: ", getwd(), "/shiny")
}

r_files <- list.files("shiny", pattern = "\\.R$", full.names = TRUE)
if (length(r_files) == 0) {
    stop(
        "No R files found in the 'shiny' directory at path: ",
        getwd(),
        "/shiny"
    )
}

# Utility functions for parsing R package dependencies in a directory
# modified from automagic package's code

# Find all matches of a regex in a vector of lines
finder <- function(rgx, lns) {
    regmatches(lns, gregexpr(rgx, lns, perl = TRUE, ignore.case = TRUE)) |> unlist()
}

# Read and tidy R file, returning code lines
get_lines <- function(file_name) {
    lns <- tryCatch(
        formatR::tidy_source(
            file_name,
            comment = FALSE,
            blank = FALSE,
            arrow = TRUE,
            brace.newline = TRUE,
            output = FALSE
        )$text.mask,
        error = function(e) {
            message(sprintf("Could not parse R code in: %s", file_name))
            message("   Make sure you are specifying the right file name")
            message("   and check for syntax errors")
            stop("", call. = FALSE)
        }
    )
    if (is.null(lns)) stop("No parsed text available", call. = FALSE)
    lns
}

# Extract package names from a file using common patterns
parse_packages <- function(file) {
    lns <- get_lines(file)
    patterns <- list(
        library = "(?<=(library\\()|(library\\([\"']{1}))[[:alnum:]_.]+",
        require = "(?<=(require\\()|(require\\([\"']{1}))[[:alnum:]_.]+",
        colon = "[[:alnum:]_.]+(?=:{2,3})",
        github = "(?<=github\\s=\\sc\\(|github=\\sc\\(|github\\s=c\\(|github=c\\()[^\\)]+",
        bioconductor = "(?<=bioconductor\\s=\\sc\\(|bioconductor=\\sc\\(|bioconductor\\s=c\\(|bioconductor=c\\()[^\\)]+"
    )
    pkgs <- lapply(patterns, finder, lns = lns)
    pkgs <- list(cran = c(pkgs$library, pkgs$require, pkgs$colon),
                 github = gsub('"', '', strsplit(pkgs$github, c(","," "))),
                 bioconductor = gsub('"', '', strsplit(pkgs$bioconductor, c(","," "))))
    non_cran <- c(pkgs$bioconductor, gsub("[[:alnum:]_.]+\\/", "", pkgs$github, perl = TRUE))
    pkgs$cran <- pkgs$cran[!pkgs$cran %in% non_cran]
    lapply(pkgs, function(p) {
      pk <- unique(p)
      pk[!pk %in% c(""," ")]
    })
}

# Get all unique package dependencies from R files in a directory
get_dependent_packages <- function(directory = getwd()) {
    files <- list.files(
        path = directory,
        pattern = "\\.R$",
        full.names = TRUE,
        recursive = FALSE
    )
    pkg_names <- do.call(Map, c(function(...) unique(c(...)), lapply(files, parse_packages)))
    if (length(unlist(pkg_names)) == 0) {
        message("Warning: no packages found in specified directory")
        return(invisible(NULL))
    }
    pkg_names
}

pkgs <- get_dependent_packages(directory = "shiny")
cran_pkgs <- unique(c("shiny", unname(unlist(pkgs$cran))))

github_pkgs <- c(
  # "r-lib/cli",
  # "tidyverse/ggplot2",
  unique(unname(unlist(pkgs$github)))
)

bioconductor_pkgs <- c(
  # "airway",
  # "AnnotationDbi",
  unique(unname(unlist(pkgs$bioconductor)))
)

cran_pkgs <- paste0("cran::", cran_pkgs)

if (length(github_pkgs) > 0) {
    github_pkgs <- paste0("github::", github_pkgs)
}

if (length(bioconductor_pkgs) > 0) {
    bioconductor_pkgs <- paste0("bioc::", bioconductor_pkgs)
}

install_with_pak <- function(
    cran_pkgs,
    github_pkgs = NULL,
    bioconductor_pkgs = NULL,
    library_path = library_path,
    remove_dirs = c(
        "help",
        "doc",
        "tests",
        "html",
        "include",
        "unitTests",
        file.path("libs", "*dSYM")
    )
) {
    dir.create(library_path, showWarnings = FALSE, recursive = TRUE)

    pkgs <- c(cran_pkgs, github_pkgs, bioconductor_pkgs)
    if (length(pkgs) == 0) {
        message("No packages to install")
        return(invisible(NULL))
    }

    pak::pak(
        pkgs,
        lib = library_path,
        ask = FALSE,
        upgrade = FALSE
    )

    lapply(
        list.dirs(library_path, full.names = TRUE, recursive = FALSE),
        function(x) {
            unlink(file.path(x, remove_dirs), force = TRUE, recursive = TRUE)
        }
    )
    invisible(NULL)
}

install_with_pak(
    cran_pkgs = cran_pkgs,
    github_pkgs = github_pkgs,
    bioconductor_pkgs = bioconductor_pkgs,
    library_path = library_path
)
