import React from 'react';
import { templates, TemplateMetadata } from '../data/templates';
import { useProjectStore } from '../store/projectStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ isOpen, onClose }) => {
  const { loadProjectFromTemplate } = useProjectStore();

  const handleUseTemplate = (id: string) => {
    loadProjectFromTemplate(id);
    onClose();
  };

  const getDifficultyColor = (diff: TemplateMetadata['difficulty']) => {
    switch (diff) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'info';
      case 'Advanced': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hardware Blueprint Templates"
      size="xl"
      footer={
        <Button onClick={onClose} variant="secondary" size="sm">
          Cancel
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 mb-2">
          <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Selecting a template initializes a pre-configured hardware workspace complete with blueprint canvas layouts, component BOM rows, pin maps, and test verification stages. <strong>This creates a new project and sets it as active.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <Card 
              key={tpl.id}
              hoverable
              className="flex flex-col h-full border border-slate-200 hover:border-slate-350"
            >
              <CardHeader className="bg-slate-50/50 pb-2">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="truncate font-bold text-slate-800 tracking-wider">
                    {tpl.name}
                  </CardTitle>
                  <Badge variant={getDifficultyColor(tpl.difficulty)}>
                    {tpl.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between p-4 space-y-4">
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {tpl.description}
                </p>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                    Workspace Inclusions
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-650">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${tpl.includes.blueprint ? 'text-emerald-500' : 'text-slate-200'}`} />
                      <span className={tpl.includes.blueprint ? 'text-slate-700' : 'text-slate-400 line-through'}>Blueprint Flow</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${tpl.includes.bom ? 'text-emerald-500' : 'text-slate-200'}`} />
                      <span className={tpl.includes.bom ? 'text-slate-700' : 'text-slate-400 line-through'}>BOM Sourced</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${tpl.includes.power ? 'text-emerald-500' : 'text-slate-200'}`} />
                      <span className={tpl.includes.power ? 'text-slate-700' : 'text-slate-400 line-through'}>Power Budget</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${tpl.includes.pins ? 'text-emerald-500' : 'text-slate-200'}`} />
                      <span className={tpl.includes.pins ? 'text-slate-700' : 'text-slate-400 line-through'}>Pin Map</span>
                    </div>
                    <div className="flex items-center space-x-1.5 col-span-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${tpl.includes.tests ? 'text-emerald-500' : 'text-slate-200'}`} />
                      <span className={tpl.includes.tests ? 'text-slate-700' : 'text-slate-400 line-through'}>Verification Protocol</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={() => handleUseTemplate(tpl.id)} 
                    variant="primary" 
                    size="sm"
                    className="w-full justify-between"
                  >
                    <span>Use this Template</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Modal>
  );
};
