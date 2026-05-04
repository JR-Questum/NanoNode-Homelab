import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "NanoNode",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,

    analytics: {
      provider: "plausible",
    },

    locale: "en-US",
    baseUrl: "jr-questum.github.io/nanonode-homelab/",

    ignorePatterns: [
      "private",
      "templates",
      ".obsidian",
      "**/.obsidian/**",
      "**/*.excalidraw.md",
    ],

    defaultDateType: "modified",

    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,

      typography: {
        header: "Zen Kaku Gothic New",
        body: "Noto Sans",
        code: "JetBrains Mono",
      },

      colors: {
        lightMode: {
          light: "#F3EFE7",          
          lightgray: "#DED9CE",      
          gray: "#B8B2A7",           
          darkgray: "#5C5A56",       
          dark: "#2B2A28",           
          secondary: "#8C8B65",      
          tertiary: "#A6A38A",       
          highlight: "rgba(140, 139, 101, 0.15)",
          textHighlight: "rgba(200, 196, 120, 0.45)",
        },

        darkMode: {
          light: "#1C1B1A",        
          lightgray: "#2A2927",
          gray: "#5A5854",
          darkgray: "#C9C6BE",
          dark: "#EFEDE8",
          secondary: "#9A986F",     
          tertiary: "#6F6D57",
          highlight: "rgba(154, 152, 111, 0.18)",
          textHighlight: "rgba(200, 196, 120, 0.35)",
        },
      },
    },
  },

  plugins: {
    transformers: [
      Plugin.FrontMatter(),

      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),

      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),

      Plugin.ObsidianFlavoredMarkdown({
        enableInHtmlEmbed: false,
      }),

      Plugin.GitHubFlavoredMarkdown(),

      Plugin.TableOfContents({
        maxDepth: 3,
      }),

      Plugin.CrawlLinks({
        markdownLinkResolution: "shortest",
      }),

      Plugin.Description(),

      Plugin.Latex({
        renderEngine: "katex",
      }),
    ],

    filters: [
      Plugin.RemoveDrafts(),
    ],

    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),

      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),

      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),

      // Disable if build time matters
      Plugin.CustomOgImages(),
    ],
  },
}

export default config