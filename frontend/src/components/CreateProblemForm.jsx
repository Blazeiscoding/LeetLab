import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Code2,
  FileText,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  Download,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { problemSchema } from "../util/zodSchema";
const CreateProblemForm = () => {
  const navigation = useNavigate();
  const {} = useForm({ resolver: zodResolver(problemSchema),
    
   });
  return <div>CreateProblemForm</div>;
};

export default CreateProblemForm;
