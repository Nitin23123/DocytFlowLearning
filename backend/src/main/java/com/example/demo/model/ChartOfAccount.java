package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chart_of_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartOfAccount {
    @Id
    private String code; // e.g. "6080"
    private String name; // e.g. "Cloud Hosting & SaaS"
    private String category; // e.g. "Operating Expense", "Cost of Goods Sold"
    private String defaultDescription;
}
