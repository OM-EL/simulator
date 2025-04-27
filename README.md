# Transformers Model - How It Works

```mermaid
graph TD
    A[Input Sequence] -->|Tokenization| B[Embedding Layer]
    B --> C[Positional Encoding]
    C --> D[Encoder Stack]
    D --> E[Self-Attention]
    E --> F[Feed Forward]
    F --> G[Add & Norm]
    G --> H[Decoder Stack]
    H --> I[Masked Self-Attention]
    I --> J[Encoder-Decoder Attention]
    J --> K[Feed Forward]
    K --> L[Add & Norm]
    L --> M[Linear & Softmax]
    M --> N[Output Probabilities]

    subgraph Encoder
        D
        E
        F
        G
    end
    subgraph Decoder
        H
        I
        J
        K
        L
    end
```

This diagram illustrates the main flow of a transformer model, showing the encoder and decoder stacks, attention mechanisms, and how input is transformed into output probabilities.

---

# How Banks Lend Money in Europe

```mermaid
graph TD
    A[Customer Applies for Loan] --> B[Bank Reviews Application]
    B --> C[Credit Assessment & Risk Analysis]
    C --> D[Loan Approval]
    D --> E[Loan Agreement Signed]
    E --> F[Funds Disbursed to Customer]
    F --> G[Customer Repays Loan with Interest]
    G --> H[Bank Reports to Credit Agencies]
    D -.->|If Rejected| I[Application Denied]

    subgraph Loan Process
        B
        C
        D
        E
        F
        G
    end
```

This diagram summarizes the typical process for how banks lend money in Europe, from application to repayment and reporting.