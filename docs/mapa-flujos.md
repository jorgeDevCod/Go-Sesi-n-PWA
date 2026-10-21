# Mapa mental y flujos de Go Sesión

> Vista rápida de **todas las rutas, entradas y caminos** de la plataforma.
> Los diagramas están en **Mermaid**: GitHub los renderiza automáticamente al abrir este archivo. En VS Code necesitas la extensión *Markdown Preview Mermaid Support* (o pegar el bloque en <https://mermaid.live>).
> También dejé un árbol de texto al inicio para leerlo sin renderizar.

---

## 1. Mapa mental general

```text
GO SESIÓN
│
├── 1. ACCESO
│   ├── Landing pública
│   ├── Registro (crea cuenta + 5 categorías / 13 actividades)
│   ├── Login
│   └── Recuperar contraseña (correo)
│
├── 2. ONBOARDING (solo si es nuevo o no ha visto el aviso del día)
│   ├── Bienvenida
│   ├── Planificar mi día
│   ├── Conocer la app (guía)
│   ├── Ánimo del día (energía)
│   └── Omitir
│
├── 3. HOME (hub diario)
│   ├── Categorías
│   ├── Plan de hoy
│   ├── Accesos rápidos
│   ├── Agregar actividad
│   └── "No sé qué hacer" → recomendación
│
├── 4. EMPEZAR UNA SESIÓN
│   ├── Elegir categoría → actividad
│   ├── Recomendación por energía y dificultad
│   ├── Modo Clásico (tiempo único)
│   ├── Modo Pomodoro (foco / descanso / ciclos)
│   ├── Cuenta regresiva
│   └── Timer fullscreen
│       ├── Pausar / reanudar
│       ├── Extender
│       ├── Finalizar (interrumpir)
│       └── Alarma + notificación
│
├── 5. TERMINAR
│   ├── Completada
│   ├── Interrumpida
│   ├── Volver al home
│   ├── Repetir / recomendaciones
│   └── Historial
│
├── 6. PLANIFICAR
│   ├── Abrir desde Home / Header / Bienvenida
│   ├── Elegir categorías y actividades
│   ├── Crear categoría o actividad inline
│   ├── Editar títulos
│   ├── Quitar actividades
│   └── Guardar plan del día
│
├── 7. PERSONALIZAR
│   ├── Categorías (crear, editar, eliminar)
│   ├── Actividades (crear, editar, reordenar, eliminar)
│   │   └── Editar actividad → Programación Pomodoro
│   ├── Tiempos pre-programados
│   │   ├── Nivel Ligero / Medio / Intenso
│   │   ├── Sesión clásica (mín / rec / máx)
│   │   └── Pomodoro del nivel
│   └── Recomendaciones
│       ├── Energía + dificultad
│       ├── Tiempos (mín / rec / máx / personalizados)
│       └── Qué actividades recomendar
│
├── 8. HISTORIAL
│   ├── Estadísticas (racha, sesiones, minutos, %)
│   ├── Sesiones agrupadas por día
│   └── Eliminar entrada
│
├── 9. PAPELERA
│   ├── Deshacer (5 s)
│   ├── Restaurar
│   ├── Vaciar
│   └── Borrado permanente
│
├── 10. CUENTA
│   ├── Exportar datos (JSON)
│   ├── Notificaciones push
│   └── Eliminar cuenta
│
└── 11. TRANSVERSAL
    ├── Temas (6)
    ├── PWA instalable
    ├── Offline + cola de reintentos
    ├── Reanudar sesión activa
    ├── Preferencias sincronizadas
    └── Seguridad (auth, rate-limit, permisos)
```

```mermaid
mindmap
  root((Go Sesión))
    Acceso
      Landing
      Registro
      Login
      Recuperar contraseña
    Onboarding
      Bienvenida
      Planificar
      Ánimo
      Guía
      Omitir
    Home
      Categorías
      Plan de hoy
      Accesos rápidos
      Agregar actividad
      No sé qué hacer
    Sesión
      Clásico
      Pomodoro
      Recomendación
      Timer
      Pausar y reanudar
      Extender
      Finalizar
    Terminar
      Completada
      Interrumpida
      Historial
      Volver al home
    Planificar
      Categorías
      Actividades
      Guardar plan
    Personalizar
      Categorías
      Actividades
      Programación Pomodoro
      Tiempos por nivel
      Recomendaciones
    Historial
      Estadísticas
      Sesiones
      Eliminar
    Papelera
      Deshacer
      Restaurar
      Vaciar
      Borrado permanente
    Cuenta
      Exportar
      Notificaciones
      Eliminar cuenta
    Transversal
      Temas
      PWA
      Offline
      Reanudar sesión
```

---

## 2. Rutas principales

| Ruta | Acceso | Para qué sirve | Sale hacia |
|---|---|---|---|
| `/` | Público | Landing, beneficios, instalación PWA, guía | `/login`, `/register` |
| `/login` | Público | Iniciar sesión | `/app/home` |
| `/register` | Público | Crear cuenta + datos iniciales | `/app/home` |
| `/forgot-password` | Público | Pedir enlace de recuperación | Correo |
| `/reset-password/[token]` | Público | Definir nueva contraseña | `/login` |
| `/app/home` | Privado | Hub: categorías, plan, rápidos, recomendación | Sesión, plan, personalizar |
| `/app/session/recommend` | Privado | "No sé qué hacer": energía, ánimo, ranking | Configurar sesión |
| `/app/session/new?category=` | Privado | Elegir actividad de una categoría | Configurar sesión |
| `/app/session/new?category=&activity=` | Privado | Saltar directo a una actividad | Configurar sesión |
| `/app/session` | Privado | Timer fullscreen de la sesión activa | Fin de sesión |
| `/app/routine` | Privado | Personalizar: categorías, actividades, recomendaciones | Home, sesión |
| `/app/routine?tab=actividades` | Privado | Abrir directo la pestaña Actividades | Actividades |
| `/app/subcategories` | Privado | Gestionar actividades por categoría | Sesión, papelera |
| `/app/history` | Privado | Estadísticas e historial de sesiones | Home, repetir |
| `/app/trash` | Privado | Restaurar o borrar definitivamente | Actividades |
| `/app/account` | Privado | Exportar datos, push, eliminar cuenta | `/login` |
| `/api/auth/[...nextauth]` | Público | Sesión Auth.js | — |

---

## 3. Flujo de entrada y onboarding

```mermaid
flowchart TD
  LAND["Landing /"] --> ASK{"¿Ya tienes cuenta?"}
  ASK -->|"No"| REG["Registro"]
  ASK -->|"Sí"| LOG["Login"]
  REG --> HOME["Home /app/home"]
  LOG --> WEL["Bienvenida"]
  HOME --> WEL

  WEL -->|"Personalizar"| ROU["Personalizar /app/routine"]
  WEL -->|"Planificar mi día"| PLAN["Planificación"]
  WEL -->|"Conocer la app"| GUIDE["Guía de uso"]
  WEL -->|"Omitir"| MOOD["Ánimo del día"]
  WEL -->|"No mostrar más hoy"| HOME

  PLAN --> HOME
  GUIDE --> HOME
  MOOD --> HOME
  ROU --> HOME
```

**Caminos alternos**
- Si ya respondió el ánimo hoy, no vuelve a preguntarse.
- Si ya existe un plan, al pedir "conocer la app" aparece el aviso *mantener plan / empezar de cero*.
- La bienvenida se puede ocultar por el resto del día.

---

## 4. Ciclo principal: empezar → enfocar → terminar

```mermaid
flowchart LR
  HOME["Home"] --> REC["No sé qué hacer"]
  HOME --> CAT["Elegir categoría"]
  PLAN["Plan de hoy"] --> CAT
  QUICK["Acceso rápido"] --> NEW["Elegir actividad"]
  CAT --> NEW
  REC --> ENERGY["Energía + dificultad"]
  ENERGY --> RANK["Recomendaciones"]
  RANK --> START["Configurar sesión"]
  NEW --> START

  START --> MODE{"Modo"}
  MODE -->|"Clásico"| CLASSIC["Duración + cuenta regresiva"]
  MODE -->|"Pomodoro"| POMO["Programación predefinida + ajustar"]
  CLASSIC --> TIMER["Timer fullscreen"]
  POMO --> TIMER

  TIMER -->|"Pausar"| PAUSE["Pausado"]
  PAUSE -->|"Reanudar"| TIMER
  TIMER -->|"Extender"| TIMER
  TIMER -->|"Interrumpir"| INT["Fin INTERRUPTED"]
  TIMER -->|"Llegó a 0"| DONE["Fin COMPLETED"]

  DONE --> ACTIONS["Volver al home / Historial / Repetir"]
  INT --> ACTIONS
```

### Detalle del modo Pomodoro

```mermaid
flowchart TD
  EDIT["Editar actividad"] --> DIFF["Dificultad: Ligera / Media / Intensa"]
  DIFF --> TIER["Nivel: Ligero / Medio / Intenso"]
  EDIT --> PROG["Programación: foco, descanso, ciclos, toggles"]
  PROG --> SAVE["Guardar actividad"]
  SAVE --> OWN["Configuración propia de la actividad"]
  SAVE --> PRESET["Predefinida del nivel elegido"]
  OWN --> DROP["Desplegable de la vista Pomodoro"]
  PRESET --> DROP
  DROP --> RECOMMEND["La opción del nivel de la actividad aparece como recomendada"]
  RECOMMEND --> TIMER["Iniciar sesión Pomodoro"]
```

**Regla actual**
1. La dificultad de la actividad decide su nivel (`Ligera → ligero`, `Media → medio`, `Intensa → intenso`).
2. Lo que configures en **Programación** se guarda en la actividad y también como predefinido de ese nivel.
3. En la vista Pomodoro, el desplegable muestra los 3 niveles y marca el recomendado.
4. Si la actividad tiene configuración propia, esa manda al iniciar.

---

## 5. Planificación diaria

```mermaid
flowchart TD
  ENTRY["Home / Header / Bienvenida"] --> OPEN["Abrir planificación"]
  OPEN --> HAS{"¿Ya hay plan?"}
  HAS -->|"No"| MODAL["PlanningModal"]
  HAS -->|"Sí"| PROMPT["¿Mantener o cambiar?"]
  PROMPT -->|"Cambiar"| MODAL
  PROMPT -->|"Mantener"| HOME["Home con plan"]
  MODAL --> EDIT["Elegir categorías y actividades"]
  EDIT --> INLINE["Crear categoría o actividad inline"]
  INLINE --> EDIT
  EDIT --> SAVE["Guardar plan del día"]
  SAVE --> HOME
  HOME --> PLAY["Reproducir actividad"]
  PLAY --> SESSION["Nueva sesión"]
  HOME --> MARK["Editar / quitar actividades del plan"]
```

**Estados**
- Sin plan: se abre el modal vacío.
- Con plan: primero se pregunta si mantenerlo o cambiarlo.
- El plan se guarda por día (zona horaria de Lima).
- Las actividades del plan se pueden editar o quitar sin salir del Home.

---

## 6. Personalización

```mermaid
flowchart TD
  ROUTE["Personalizar /app/routine"] --> CATS["Categorías"]
  ROUTE --> ACTS["Actividades"]
  ROUTE --> RECS["Recomendaciones"]

  CATS --> CATCRUD["Crear / editar / eliminar categoría"]
  CATCRUD --> CATDIFF["Dificultad y energía por categoría"]

  ACTS --> LIST["Actividades de la categoría"]
  LIST --> ACTCRUD["Crear / editar / reordenar / eliminar"]
  ACTCRUD --> MODAL["Modal de actividad"]
  MODAL --> PROG["Programación Pomodoro"]
  MODAL --> ICON["Icono + color"]

  ACTS --> TIME["Tiempos pre-programados"]
  TIME --> LEVEL["Ligero / Medio / Intenso"]
  LEVEL --> CLASSIC["Sesión clásica: mínimo / recomendado / máximo"]
  LEVEL --> POMO["Pomodoro del nivel"]

  RECS --> COMBO["Energía + dificultad"]
  COMBO --> TIMES["Tiempos mín / rec / máx / personalizados"]
  COMBO --> PICKS["Actividades a recomendar"]
```

**Puntos clave**
- **Categorías** definen dificultad y energía; alimentan las recomendaciones.
- **Actividades** heredan la dificultad de su categoría, pero se puede cambiar.
- **Tiempos pre-programados** edita los 3 niveles y muestra en dos columnas la sesión clásica y el Pomodoro.
- **Recomendaciones** define qué actividades y tiempos se usan para cada combinación energía + dificultad.
- Los cambios se guardan en `localStorage` y se sincronizan con el servidor.

---

## 7. Recomendación por energía

```mermaid
flowchart TD
  ENTER["Entrar a /app/session/recommend"] --> MOOD{"¿Ánimo respondido hoy?"}
  MOOD -->|"No"| SURVEY["Elegir energía y dificultad"]
  MOOD -->|"Sí"| LOAD["Cargar recomendaciones"]
  SURVEY --> LOAD
  LOAD --> RANK["Ranking: plan, recencia, tasa, favoritas"]
  RANK --> TOP["Top de recomendaciones"]
  TOP --> START["Empezar esta actividad"]
  TOP --> EDIT["Editar / eliminar actividad"]
  TOP --> FEED["👍 / 👎"]
  TOP --> SEARCH["Buscar o ver todas"]
  SEARCH --> START
  START --> FLOW["Configurar sesión"]
```

**Caminos alternos**
- Si no hay coincidencias por energía, se muestran todas.
- `👍` sube la actividad; `👎` la retira.
- Si es de noche, se priorizan sesiones cortas.
- Si ya hay una sesión activa, al iniciar se reutiliza.

---

## 8. Papelera y borrado

```mermaid
flowchart TD
  DEL["Eliminar categoría o actividad"] --> UNDO["Aviso Deshacer 5 s"]
  UNDO -->|"Deshacer"| RESTORE["Restaurar"]
  UNDO -->|"Esperar"| TRASH["Papelera /app/trash"]
  TRASH --> VIEW["Ver elementos"]
  VIEW --> RESTORE2["Restaurar"]
  VIEW --> EMPTY["Vaciar papelera"]
  VIEW --> PERM["Borrado permanente"]
  PERM --> BLOCK{"¿Tiene sesiones asociadas?"}
  BLOCK -->|"Sí"| FAIL["No se puede borrar"]
  BLOCK -->|"No"| GONE["Eliminado"]
```

**Reglas**
- Retención: 15 días.
- Máximo: 50 elementos.
- Una categoría con actividades no se elimina hasta vaciarla o mover sus actividades.
- El borrado permanente falla si hay historial de sesiones asociado.

---

## 9. Historial, cuenta y acciones transversales

```mermaid
flowchart LR
  HIST["Historial"] --> STATS["Estadísticas"]
  HIST --> DAYS["Sesiones por día"]
  HIST --> DELETE["Eliminar registro"]
  ACC["Cuenta"] --> EXPORT["Exportar JSON"]
  ACC --> PUSH["Activar notificaciones"]
  ACC --> DELACC["Eliminar cuenta"]
  DELACC --> LOGOUT["Cerrar sesión"]
  GLOBAL["Global"] --> RESUME["Reanudar sesión activa"]
  GLOBAL --> THEME["Cambiar tema"]
  GLOBAL --> OFFLINE["Offline + reintentos"]
  GLOBAL --> PWA["Instalar PWA"]
```

**Acciones globales**
- **Reanudar sesión**: si hay una sesión activa y no estás en el timer, aparece un aviso para continuar o ignorar.
- **Temas**: 6 opciones visuales.
- **PWA**: instalable, con iconos y modo standalone.
- **Offline**: las acciones de preferencias y feedback se encolan y se reintentan.
- **Notificaciones**: permiso al iniciar sesión; push configurable desde Cuenta.

---

## 10. Atajos por intención

| Quiero... | Camino |
|---|---|
| Empezar rápido | Home → categoría → actividad → Iniciar |
| No decidir | Home → "No sé qué hacer" → recomendación → Empezar |
| Seguir mi plan | Home → Plan de hoy → Play |
| Organizar mi día | Header → Planificación |
| Ajustar mis tiempos | Personalizar → Actividades → Tiempos pre-programados |
| Configurar Pomodoro de una actividad | Personalizar → Actividades → Editar → Programación |
| Cambiar qué me recomiendan | Personalizar → Recomendaciones |
| Ver mi progreso | Header → Historial |
| Recuperar algo borrado | Header → Papelera |
| Instalar la app | Landing → Descargar como app |
| Cambiar el tema | Header → selector de tema |
| Exportar mis datos | Cuenta → Exportar mis datos |

---

## 11. Guards y estados que afectan los caminos

| Situación | Efecto |
|---|---|
| Sin sesión | `/app/*` redirige a `/login` |
| Sin `?category` en sesión nueva | Redirige a `/app/home` |
| Categoría inexistente | Redirige a `/app/home` |
| Sesión activa existente | Se reutiliza al iniciar otra |
| Sesión activa fuera del timer | Aparece "Reanudar sesión" |
| Ánimo ya respondido hoy | No se vuelve a preguntar |
| Bienvenida oculta hoy | No aparece de nuevo hasta mañana |
| Plan existente | Se pregunta mantener o cambiar |
| Sin coincidencias por energía | Se muestran todas |
| Categoría con actividades | No se puede eliminar |
| Actividad con historial | No se puede borrar permanentemente |
| Sin conexión | Preferencias y feedback se encolan |

---

*Última actualización: flujos de Personalizar > Actividades, Pomodoro por nivel, recomendación por dificultad y vista fluida sin tabs.*
