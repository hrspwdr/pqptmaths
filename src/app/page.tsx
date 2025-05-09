'use client';

import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MAX_DATES = 10;

const t = {
  requestNumber: "Numéro de trajectoire",
  confirmPrint: "Veuillez confirmer que toutes les informations sont exactes. Une fois le PDF généré, toutes les données seront effacées.",
  providerName: "Nom de l’intervenant",
  dob: "Date de naissance",
  hin: "Numéro d'assurance maladie",
  confirm: "Confirmer",
  cancel: "Annuler",
  date: "Date",
  delete: "Supprimer",
  phq9Total: "Score total PHQ-9",
  gad7Total: "Score total GAD-7",
  wsasTotal: "Score total WSAS",
  aboveThreshold: "Au-dessus du seuil clinique",
  belowThreshold: "Au-dessous du seuil clinique",
  suicidalCheckbox: "Score > 0 à la question 9?",
  suicidalYes: "Idéation suicidaire",
  suicidalNo: "Aucune idéation suicidaire",
  total: "Total",
  addDate: "Ajouter une date",
  print: "Imprimer en PDF",
  phqTitle: "Symptômes dépressifs dans le temps",
  gadTitle: "Symptômes anxieux dans le temps",
  wsasTitle: "Impact fonctionnel dans le temps",
  header: "Évolution de l'état de l'usager",
};

export default function MentalHealthTracker() {
  const [entries, setEntries] = useState([
    {
      date: new Date().toISOString().substring(0, 10),
      phq9Total: 0,
      gad7Total: 0,
      wsasTotal: 0,
      suicidal: false,
    },
  ]);
  const [providerName, setProviderName] = useState("");
  const [requestNumber, setRequestNumber] = useState("");
  const [dob, setDob] = useState("");
  const [hin, setHin] = useState("");

  const resetAll = () => {
    setProviderName("");
    setRequestNumber("");
    setDob("");
    setHin("");
    setEntries([]);
  };

  const handlePrint = () => {
    if (window.confirm(t.confirmPrint)) {
      window.print();
      resetAll();
    }
  };

  const addEntry = () => {
    if (entries.length < MAX_DATES) {
      setEntries([
        ...entries,
        {
          date: new Date().toISOString().substring(0, 10),
          phq9Total: 0,
          gad7Total: 0,
          wsasTotal: 0,
          suicidal: false,
        },
      ]);
    }
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateDate = (index, date) => {
    const updatedEntries = [...entries];
    updatedEntries[index].date = date;
    setEntries(updatedEntries);
  };

  const updateField = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = field === "suicidal" ? value : parseInt(value) || 0;
    setEntries(updatedEntries);
  };

  const renderGraph = (title, data, color) => {
    const chartData = {
      labels: data.map((entry) => entry.date),
      datasets: [
        {
          label: "Score",
          data: data.map((entry) => entry.score),
          backgroundColor: color,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Score",
          },
        },
      },
    };

    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
          <Bar data={chartData} options={options} />
        </CardContent>
      </Card>
    );
  };

  const phqData = entries.map((entry) => ({
    date: format(new Date(entry.date), "yyyy-MM-dd"),
    score: entry.phq9Total,
  }));

  const gadData = entries.map((entry) => ({
    date: format(new Date(entry.date), "yyyy-MM-dd"),
    score: entry.gad7Total,
  }));

  const wsasData = entries.map((entry) => ({
    date: format(new Date(entry.date), "yyyy-MM-dd"),
    score: entry.wsasTotal,
  }));

  return (
    <div className="p-4 space-y-6 print:p-8 print:relative">
      <div className="absolute right-0 top-0 w-[85.6mm] h-[53.98mm] hidden print:block bg-white"></div>

      <div className="bg-[#095797] text-white text-lg font-medium px-4 py-3" style={{ fontFamily: "Roboto", height: 60 }}>
        {t.header}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {entries.map((entry, i) => (
          <Card key={i} className="space-y-4 p-4 break-inside-avoid">
            <div className="flex justify-between items-center gap-2">
              <Label>{t.date}</Label>
              <Input type="date" value={entry.date} onChange={(e) => updateDate(i, e.target.value)} />
              <Button variant="destructive" onClick={() => removeEntry(i)}>
                {t.delete}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{t.phq9Total}</Label>
              <Input
                type="number"
                min="0"
                max="27"
                value={entry.phq9Total}
                onChange={(e) => updateField(i, "phq9Total", e.target.value)}
              />
              <div>{entry.phq9Total >= 10 ? t.aboveThreshold : t.belowThreshold}</div>
              <div className="mt-2">
                <Label className="mr-2">{t.suicidalCheckbox}</Label>
                <input
                  type="checkbox"
                  checked={entry.suicidal}
                  onChange={(e) => updateField(i, "suicidal", e.target.checked)}
                />
              </div>
              <div className={entry.suicidal ? "text-red-600" : "text-green-600"}>
                {entry.suicidal ? t.suicidalYes : t.suicidalNo}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.gad7Total}</Label>
              <Input
                type="number"
                min="0"
                max="21"
                value={entry.gad7Total}
                onChange={(e) => updateField(i, "gad7Total", e.target.value)}
              />
              <div>{entry.gad7Total >= 8 ? t.aboveThreshold : t.belowThreshold}</div>
            </div>

            <div className="space-y-2">
              <Label>{t.wsasTotal}</Label>
              <Input
                type="number"
                min="0"
                max="40"
                value={entry.wsasTotal}
                onChange={(e) => updateField(i, "wsasTotal", e.target.value)}
              />
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={addEntry}>{t.addDate}</Button>
      {entries.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderGraph(t.phqTitle, phqData, "#3b82f6")}
          {renderGraph(t.gadTitle, gadData, "#10b981")}
          {renderGraph(t.wsasTitle, wsasData, "#f59e0b")}
        </div>
      )}

      <Button className="print:hidden" onClick={handlePrint}>
        {t.print}
      </Button>
    </div>
  );
}
