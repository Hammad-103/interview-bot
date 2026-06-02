export const QUESTIONS = {
  "Frontend Dev": {
    Junior: [
      "What is the difference between var, let, and const in JavaScript?",
      "Explain the CSS box model.",
      "What is the difference between == and ===?",
      "What is a Promise in JavaScript?",
      "How does the browser render a webpage?"
    ],
    Mid: [
      "Explain how React's virtual DOM works and why it improves performance.",
      "What is the difference between useMemo and useCallback?",
      "How does CSS specificity work?",
      "Explain event delegation in JavaScript.",
      "What are Web Workers and when would you use them?"
    ],
    Senior: [
      "How would you architect a large-scale React application for performance?",
      "Explain micro-frontends — when would you use them?",
      "How do you handle state management in complex React apps?",
      "Describe your approach to accessibility in frontend development.",
      "How would you optimize the critical rendering path?"
    ]
  },
  "Backend Dev": {
    Junior: [
      "What is REST and what are its key principles?",
      "Explain the difference between SQL and NoSQL databases.",
      "What is middleware in Express.js?",
      "Explain what HTTP status codes 200, 400, 401, 403, 404 and 500 mean.",
      "What is an API and how does it work?"
    ],
    Mid: [
      "How would you design a rate limiting system?",
      "Explain database indexing and when to use it.",
      "What is the difference between horizontal and vertical scaling?",
      "How does JWT authentication work?",
      "Explain the CAP theorem."
    ],
    Senior: [
      "How would you design a distributed system for millions of users?",
      "Explain event sourcing and CQRS patterns.",
      "How would you handle database migrations in a live production system?",
      "What is your approach to API versioning?",
      "How do you ensure security in a microservices architecture?"
    ]
  },
  "Data Science": {
    Junior: [
      "What is the difference between supervised and unsupervised learning?",
      "Explain overfitting and how you prevent it.",
      "What is a confusion matrix?",
      "How do you handle missing data?",
      "What is cross-validation?"
    ],
    Mid: [
      "Explain the bias-variance tradeoff.",
      "When would you use Random Forest vs Gradient Boosting?",
      "How does backpropagation work?",
      "Explain feature engineering with an example.",
      "What is regularization and why is it used?"
    ],
    Senior: [
      "How would you build an ML pipeline for production?",
      "Explain transformer architecture.",
      "How do you handle class imbalance in a dataset?",
      "Design an A/B testing framework from scratch.",
      "How would you monitor model drift in production?"
    ]
  },
  "Product Manager": {
    Junior: [
      "How do you prioritize features on a product roadmap?",
      "What is a user story?",
      "Explain the difference between output and outcome.",
      "How would you define success for a new feature?",
      "What is an MVP?"
    ],
    Mid: [
      "Walk me through how you would launch a new product feature.",
      "How do you handle conflicting stakeholder requirements?",
      "Explain a prioritization framework you have used.",
      "How do you use data to make product decisions?",
      "Tell me about a time a product decision you made failed. What did you learn?"
    ],
    Senior: [
      "How would you build a 0-to-1 product from scratch?",
      "How do you align product strategy with business goals?",
      "Describe your approach to competitive analysis.",
      "How do you build and maintain a high-performing product team?",
      "How do you decide when to build vs buy vs partner?"
    ]
  },
  "UI/UX Designer": {
    Junior: [
      "What is the difference between UI and UX?",
      "Walk me through your design process.",
      "What is a wireframe vs a prototype?",
      "How do you handle design feedback from stakeholders?",
      "What accessibility standards do you consider in design?"
    ],
    Mid: [
      "How do you conduct user research on a tight timeline?",
      "Explain how you approach information architecture.",
      "How do you design for different screen sizes?",
      "Tell me about a design decision driven by data.",
      "How do you balance user needs with business requirements?"
    ],
    Senior: [
      "How would you establish a design system from scratch?",
      "How do you measure the impact of design on business metrics?",
      "Describe how you have scaled a design team.",
      "How do you advocate for user-centered design in an engineering-heavy org?",
      "Walk me through your most complex design challenge."
    ]
  },
  "HR / Behavioral": {
    Junior: [
      "Tell me about yourself.",
      "Why do you want this role?",
      "Describe a challenge you faced and how you overcame it.",
      "How do you handle working under pressure?",
      "Where do you see yourself in 5 years?"
    ],
    Mid: [
      "Tell me about a time you had a conflict with a coworker. How did you resolve it?",
      "Describe a time you failed and what you learned.",
      "How do you manage multiple deadlines?",
      "Tell me about a time you led a project.",
      "How do you give constructive feedback?"
    ],
    Senior: [
      "How do you build and maintain a high-performing team?",
      "Describe your leadership philosophy.",
      "Tell me about a time you influenced company culture.",
      "How do you handle ambiguity and drive clarity?",
      "Describe a time you made a high-stakes decision with incomplete information."
    ]
  }
}

export const FEEDBACK = {
  strong: [
    "Clear, structured answer with a real-world example — exactly what interviewers want.",
    "Strong technical depth. You demonstrated you understand the why, not just the what.",
    "Excellent. You gave a concise answer and backed it with practical experience.",
    "Well articulated. The example you used was specific and relevant."
  ],
  average: [
    "Decent answer but could be stronger with a concrete example from your experience.",
    "The core concept is right but the explanation lacks depth. Try the STAR method.",
    "Good starting point. Consider elaborating on the trade-offs involved.",
    "Partially correct. You mentioned the key idea but missed some important details."
  ],
  weak: [
    "Too vague. Interviewers want specific examples, not general statements.",
    "This missed the mark. Review this concept — it is frequently asked at this level.",
    "The answer lacked structure and specific details. Use the STAR method.",
    "You touched the surface but did not demonstrate real understanding."
  ]
}

export const TIPS = {
  "Frontend Dev": [
    "Practice explaining React concepts out loud — not just writing code.",
    "Study browser performance profiling tools like Lighthouse and DevTools.",
    "Review CSS specificity and the cascade — it trips up many candidates."
  ],
  "Backend Dev": [
    "Revise system design fundamentals: caching, load balancing, message queues.",
    "Practice drawing architecture diagrams — interviewers love visual thinkers.",
    "Study database query optimization and indexing strategies."
  ],
  "Data Science": [
    "Be ready to explain any algorithm intuitively, not just mathematically.",
    "Practice Python ML coding on HackerRank and LeetCode.",
    "Review statistics fundamentals — probability, distributions, hypothesis testing."
  ],
  "Product Manager": [
    "Always anchor answers to user impact and business metrics.",
    "Practice the CIRCLES method for product design questions.",
    "Read case studies of successful product launches and failures."
  ],
  "UI/UX Designer": [
    "Build a strong portfolio with 2-3 deep case studies showing your process.",
    "Practice presenting your work out loud — clarity of thought matters.",
    "Learn to tie design decisions to measurable outcomes."
  ],
  "HR / Behavioral": [
    "Prepare 5-6 STAR stories that can be adapted for different questions.",
    "Practice answering out loud — fluency matters in behavioral interviews.",
    "Research the company culture before interviewing — tailor your stories."
  ]
}

export const KEYWORDS = {
  "Frontend Dev": {
    Junior: [
      ["var", "let", "const", "scope", "hoisting", "block", "function"],
      ["box model", "margin", "padding", "border", "content", "width", "height"],
      ["strict", "type", "equality", "coercion", "comparison"],
      ["promise", "async", "resolve", "reject", "then", "catch", "callback"],
      ["html", "css", "javascript", "dom", "render", "parse", "load"]
    ],
    Mid: [
      ["virtual dom", "diffing", "reconciliation", "state", "rerender", "performance"],
      ["usememo", "usecallback", "memoization", "reference", "dependency"],
      ["specificity", "cascade", "selector", "inline", "class", "id", "important"],
      ["event delegation", "bubbling", "capturing", "parent", "target", "listener"],
      ["web worker", "thread", "background", "parallel", "main thread", "performance"]
    ],
    Senior: [
      ["code splitting", "lazy loading", "bundle", "webpack", "architecture", "scalable"],
      ["micro frontend", "monorepo", "independent", "deploy", "team", "module"],
      ["redux", "context", "zustand", "state management", "global", "store"],
      ["aria", "wcag", "screen reader", "accessibility", "semantic", "keyboard"],
      ["critical path", "render blocking", "preload", "defer", "lighthouse", "ttfb"]
    ]
  },
  "Backend Dev": {
    Junior: [
      ["rest", "stateless", "endpoint", "http", "resource", "url", "method"],
      ["sql", "nosql", "relational", "schema", "table", "document", "query"],
      ["middleware", "express", "request", "response", "next", "pipeline"],
      ["200", "400", "401", "403", "404", "500", "status", "error"],
      ["api", "request", "response", "client", "server", "endpoint", "data"]
    ],
    Mid: [
      ["rate limit", "throttle", "token bucket", "redis", "window", "requests"],
      ["index", "query", "performance", "btree", "composite", "slow query"],
      ["horizontal", "vertical", "scale", "load balancer", "replicas", "sharding"],
      ["jwt", "token", "payload", "signature", "header", "verify", "expire"],
      ["cap theorem", "consistency", "availability", "partition", "tolerance"]
    ],
    Senior: [
      ["distributed", "microservices", "load balancing", "caching", "queue", "scalability"],
      ["event sourcing", "cqrs", "command", "query", "event store", "projection"],
      ["migration", "rollback", "zero downtime", "backward compatible", "version"],
      ["versioning", "uri", "header", "backward", "deprecate", "breaking change"],
      ["oauth", "zero trust", "service mesh", "mtls", "secret management", "vault"]
    ]
  },
  "Data Science": {
    Junior: [
      ["supervised", "unsupervised", "label", "training", "classification", "clustering"],
      ["overfitting", "regularization", "validation", "generalize", "training data"],
      ["confusion matrix", "precision", "recall", "f1", "true positive", "false"],
      ["missing data", "imputation", "drop", "mean", "median", "null"],
      ["cross validation", "k-fold", "train test split", "generalization", "bias"]
    ],
    Mid: [
      ["bias", "variance", "tradeoff", "underfitting", "overfitting", "complexity"],
      ["random forest", "gradient boosting", "ensemble", "xgboost", "trees", "bagging"],
      ["backpropagation", "gradient", "weights", "loss", "neural network", "layers"],
      ["feature engineering", "encoding", "normalization", "selection", "transform"],
      ["regularization", "l1", "l2", "lasso", "ridge", "penalty", "overfitting"]
    ],
    Senior: [
      ["pipeline", "mlflow", "airflow", "versioning", "serving", "monitoring", "docker"],
      ["transformer", "attention", "encoder", "decoder", "bert", "gpt", "self-attention"],
      ["class imbalance", "smote", "oversample", "undersample", "weighted", "stratify"],
      ["a/b testing", "hypothesis", "p-value", "significance", "control", "experiment"],
      ["model drift", "data drift", "monitoring", "retraining", "production", "alert"]
    ]
  },
  "Product Manager": {
    Junior: [
      ["prioritize", "roadmap", "impact", "effort", "value", "stakeholder", "backlog"],
      ["user story", "acceptance criteria", "as a user", "so that", "given when then"],
      ["output", "outcome", "metric", "impact", "result", "goal", "measure"],
      ["success metric", "kpi", "north star", "measure", "data", "retention", "conversion"],
      ["mvp", "minimum viable", "iterate", "launch", "validate", "feedback", "lean"]
    ],
    Mid: [
      ["launch", "gtm", "go to market", "stakeholder", "rollout", "feedback", "iterate"],
      ["conflict", "stakeholder", "align", "tradeoff", "negotiate", "communicate", "priority"],
      ["rice", "moscow", "kano", "ice", "prioritization", "framework", "score"],
      ["data", "metric", "funnel", "retention", "cohort", "ab test", "insight"],
      ["fail", "learn", "iterate", "retrospective", "data", "decision", "outcome"]
    ],
    Senior: [
      ["vision", "strategy", "market", "customer", "zero to one", "research", "validate"],
      ["okr", "strategy", "align", "business goal", "metric", "revenue", "growth"],
      ["competitive", "market", "positioning", "differentiation", "moat", "landscape"],
      ["hire", "mentor", "culture", "process", "feedback", "grow", "team", "performance"],
      ["build", "buy", "partner", "make vs buy", "tradeoff", "cost", "time", "risk"]
    ]
  },
  "UI/UX Designer": {
    Junior: [
      ["ui", "ux", "user interface", "experience", "visual", "interaction", "usability"],
      ["research", "wireframe", "prototype", "test", "iterate", "user", "design process"],
      ["wireframe", "prototype", "fidelity", "mockup", "sketch", "figma", "interactive"],
      ["feedback", "stakeholder", "iterate", "critique", "revise", "present", "defend"],
      ["wcag", "aria", "contrast", "screen reader", "keyboard", "accessible", "inclusive"]
    ],
    Mid: [
      ["user research", "interview", "survey", "affinity", "insight", "timeline", "guerrilla"],
      ["information architecture", "sitemap", "navigation", "hierarchy", "mental model"],
      ["responsive", "breakpoint", "mobile first", "grid", "fluid", "adaptive", "viewport"],
      ["data", "metric", "heatmap", "session", "ab test", "usability", "decision"],
      ["user need", "business goal", "tradeoff", "constraint", "balance", "justify"]
    ],
    Senior: [
      ["design system", "token", "component", "documentation", "consistency", "scalable"],
      ["metric", "conversion", "retention", "nps", "impact", "measure", "business"],
      ["team", "hire", "mentor", "process", "critique", "culture", "grow", "scale"],
      ["advocate", "research", "empathy", "educate", "process", "influence", "buy-in"],
      ["complex", "constraint", "tradeoff", "system", "ambiguous", "solution", "process"]
    ]
  },
  "HR / Behavioral": {
    Junior: [
      ["experience", "background", "skill", "goal", "motivated", "passion", "strength"],
      ["interest", "growth", "opportunity", "team", "culture", "contribute", "learn"],
      ["challenge", "solution", "overcome", "result", "learned", "approach", "action"],
      ["deadline", "prioritize", "organize", "communicate", "manage", "stress", "calm"],
      ["goal", "plan", "grow", "skill", "vision", "career", "develop", "achieve"]
    ],
    Mid: [
      ["conflict", "resolved", "communicate", "listen", "compromise", "outcome", "relationship"],
      ["failed", "learned", "improved", "accountability", "reflection", "growth", "changed"],
      ["prioritize", "deadline", "organize", "delegate", "communicate", "track", "manage"],
      ["led", "team", "responsibility", "outcome", "coordinated", "delivered", "managed"],
      ["feedback", "specific", "constructive", "outcome", "behavior", "positive", "improve"]
    ],
    Senior: [
      ["team", "performance", "culture", "hire", "develop", "retain", "feedback", "grow"],
      ["vision", "empower", "trust", "accountability", "direction", "inspire", "lead"],
      ["culture", "values", "initiative", "change", "influence", "example", "impact"],
      ["ambiguity", "clarity", "framework", "decision", "align", "communicate", "structure"],
      ["decision", "incomplete", "risk", "data", "instinct", "outcome", "accountable"]
    ]
  }
}