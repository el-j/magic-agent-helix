<template>
  <div class="languages-section">
    <div class="section-header">
      <span class="section-badge">Language Support</span>
      <h2 class="section-title">Comprehensive Multi-Language Coverage</h2>
      <p class="section-description">
        From web development to systems programming, data science to mobile apps—we've got you covered.
      </p>
    </div>

    <div class="languages-grid">
      <div
        v-for="lang in languages"
        :key="lang.name"
        class="language-card"
        :style="{ borderColor: lang.color }"
      >
        <div class="language-icon" :style="{ background: lang.gradient }">
          <i :class="lang.icon"></i>
        </div>
        <div class="language-info">
          <h3>{{ lang.name }}</h3>
          <p>{{ lang.frameworks }}</p>
        </div>
        <div class="language-check" :style="{ color: lang.color }">
          <i class="pi pi-check-circle"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const languages = [
  {
    name: 'TypeScript/JavaScript',
    frameworks: 'React, Vue, Angular, Next.js, Node.js',
    icon: 'pi pi-code',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
  {
    name: 'Python',
    frameworks: 'Django, Flask, FastAPI, NumPy, Pandas',
    icon: 'pi pi-sitemap',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  {
    name: 'Go',
    frameworks: 'Gin, Echo, Fiber, gRPC',
    icon: 'pi pi-bolt',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  },
  {
    name: 'Rust',
    frameworks: 'Actix, Rocket, Tokio, Axum',
    icon: 'pi pi-shield',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  {
    name: 'Java/Kotlin',
    frameworks: 'Spring Boot, Quarkus, Ktor, Micronaut',
    icon: 'pi pi-box',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
  },
  {
    name: 'Ruby',
    frameworks: 'Rails, Sinatra, Hanami',
    icon: 'pi pi-diamond',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
  },
  {
    name: 'PHP',
    frameworks: 'Laravel, Symfony, WordPress',
    icon: 'pi pi-globe',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
  },
  {
    name: 'C# / .NET',
    frameworks: 'ASP.NET, Blazor, Entity Framework',
    icon: 'pi pi-microsoft',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  },
  {
    name: 'C++',
    frameworks: 'Qt, Boost, CMake',
    icon: 'pi pi-cog',
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b, #475569)',
  },
  {
    name: 'Swift',
    frameworks: 'SwiftUI, UIKit, Vapor',
    icon: 'pi pi-mobile',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
  },
  {
    name: 'Elixir',
    frameworks: 'Phoenix, Ecto, LiveView',
    icon: 'pi pi-star',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
  },
  {
    name: 'Dart/Flutter',
    frameworks: 'Riverpod, Bloc, Provider',
    icon: 'pi pi-sparkles',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
  },
  {
    name: 'Scala',
    frameworks: 'Akka, Play, ZIO, Cats',
    icon: 'pi pi-sitemap',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
  },
  {
    name: 'Lua',
    frameworks: 'OpenResty, Lapis, Busted',
    icon: 'pi pi-moon',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
  },
  {
    name: 'R',
    frameworks: 'Tidyverse, Shiny, ggplot2',
    icon: 'pi pi-chart-bar',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
  },
  {
    name: 'Perl',
    frameworks: 'Mojolicious, Dancer, Catalyst',
    icon: 'pi pi-file',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
  },
  {
    name: 'Shell',
    frameworks: 'Bash, Zsh, Make',
    icon: 'pi pi-terminal',
    color: '#84cc16',
    gradient: 'linear-gradient(135deg, #84cc16, #65a30d)',
  },
  {
    name: 'SQL',
    frameworks: 'PostgreSQL, MySQL, SQLite',
    icon: 'pi pi-database',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  },
];
</script>

<style scoped>
.languages-section {
  padding: 8rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(180deg, transparent 0%, rgba(31, 41, 55, 0.3) 50%, transparent 100%);
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 9999px;
  color: rgb(52, 211, 153);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.section-description {
  font-size: 1.25rem;
  color: rgb(156, 163, 175);
  max-width: 48rem;
  margin: 0 auto;
  line-height: 1.8;
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.language-card {
  background: rgba(17, 24, 39, 0.6);
  border: 2px solid rgb(55, 65, 81);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.language-card:hover {
  transform: translateX(4px);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
}

.language-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.language-info {
  flex: 1;
  min-width: 0;
}

.language-info h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.language-info p {
  font-size: 0.875rem;
  color: rgb(156, 163, 175);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.language-check {
  font-size: 1.5rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .languages-section {
    padding: 4rem 1rem;
  }
  
  .languages-grid {
    grid-template-columns: 1fr;
  }
}
</style>
