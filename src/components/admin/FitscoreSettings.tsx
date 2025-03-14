
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Plus, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FitscoreLevel {
  id: string;
  level: number;
  min_score: number;
  max_score: number | null;
  steps_required: number;
  distance_required: number;
  streak_days_required: number;
  rewards: string[];
  color: string;
}

const FitscoreSettings = () => {
  const [levels, setLevels] = useState<FitscoreLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fitscore_settings')
        .select('*')
        .order('level', { ascending: true });
      
      if (error) throw error;
      
      setLevels(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching Fitscore levels:', err);
      setError(err.message || 'Failed to load Fitscore levels');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLevel = () => {
    const newLevel = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1;
    const prevLevel = levels.length > 0 ? levels[levels.length - 1] : null;
    
    const newMinScore = prevLevel ? prevLevel.max_score || 0 : 0;
    const newMaxScore = prevLevel ? (prevLevel.max_score || 0) + 5000 : 500;
    
    setLevels([...levels, {
      id: 'new-' + Date.now(),
      level: newLevel,
      min_score: newMinScore,
      max_score: newMaxScore,
      steps_required: 5000,
      distance_required: 2,
      streak_days_required: 1,
      rewards: ['New Badge', 'Reward Points'],
      color: 'bg-gray-200'
    }]);
  };

  const handleRemoveLevel = (indexToRemove: number) => {
    setLevels(levels.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (index: number, field: keyof FitscoreLevel, value: any) => {
    const updatedLevels = [...levels];
    
    if (field === 'rewards' && typeof value === 'string') {
      updatedLevels[index][field] = value.split(',').map(r => r.trim());
    } else {
      // @ts-ignore - we know this is safe
      updatedLevels[index][field] = value;
    }
    
    setLevels(updatedLevels);
  };

  const saveLevels = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // First, delete all existing levels
      const { error: deleteError } = await supabase
        .from('fitscore_settings')
        .delete()
        .not('id', 'is', null);
      
      if (deleteError) throw deleteError;
      
      // Then insert all current levels
      const { error: insertError } = await supabase
        .from('fitscore_settings')
        .insert(
          levels.map(level => ({
            level: level.level,
            min_score: level.min_score,
            max_score: level.max_score,
            steps_required: level.steps_required,
            distance_required: level.distance_required,
            streak_days_required: level.streak_days_required,
            rewards: level.rewards,
            color: level.color
          }))
        );
      
      if (insertError) throw insertError;
      
      toast({
        title: "Success!",
        description: "Fitscore levels have been saved.",
      });
      
      // Refresh the data
      await fetchLevels();
    } catch (err: any) {
      console.error('Error saving Fitscore levels:', err);
      setError(err.message || 'Failed to save Fitscore levels');
      toast({
        title: "Error saving levels",
        description: err.message || 'An error occurred while saving',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fitscore-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Fitscore Level Settings</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleAddLevel}
            variant="outline"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Level
          </Button>
          <Button 
            onClick={saveLevels} 
            disabled={saving}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" /> 
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {levels.map((level, index) => (
          <Card key={level.id || index} className="border-l-4" style={{ borderLeftColor: level.color.includes('bg-') ? `var(--${level.color.substring(3)})` : level.color }}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Level {level.level}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveLevel(index)}
                  className="h-8 w-8 text-red-500"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`level-${index}`}>Level Number</Label>
                  <Input
                    id={`level-${index}`}
                    value={level.level}
                    onChange={(e) => handleInputChange(index, 'level', parseInt(e.target.value) || 0)}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`color-${index}`}>Color (Tailwind class)</Label>
                  <Input
                    id={`color-${index}`}
                    value={level.color}
                    onChange={(e) => handleInputChange(index, 'color', e.target.value)}
                    placeholder="bg-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`min-score-${index}`}>Minimum Score</Label>
                  <Input
                    id={`min-score-${index}`}
                    value={level.min_score}
                    onChange={(e) => handleInputChange(index, 'min_score', parseInt(e.target.value) || 0)}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`max-score-${index}`}>Maximum Score (leave empty for max level)</Label>
                  <Input
                    id={`max-score-${index}`}
                    value={level.max_score === null ? '' : level.max_score}
                    onChange={(e) => handleInputChange(index, 'max_score', e.target.value === '' ? null : parseInt(e.target.value) || 0)}
                    type="number"
                    placeholder="No maximum (highest level)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`steps-${index}`}>Steps Required</Label>
                  <Input
                    id={`steps-${index}`}
                    value={level.steps_required}
                    onChange={(e) => handleInputChange(index, 'steps_required', parseInt(e.target.value) || 0)}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`distance-${index}`}>Distance Required (km)</Label>
                  <Input
                    id={`distance-${index}`}
                    value={level.distance_required}
                    onChange={(e) => handleInputChange(index, 'distance_required', parseFloat(e.target.value) || 0)}
                    type="number"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`streak-${index}`}>Streak Days Required</Label>
                  <Input
                    id={`streak-${index}`}
                    value={level.streak_days_required}
                    onChange={(e) => handleInputChange(index, 'streak_days_required', parseInt(e.target.value) || 0)}
                    type="number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`rewards-${index}`}>Rewards (comma separated)</Label>
                  <Textarea
                    id={`rewards-${index}`}
                    value={level.rewards.join(', ')}
                    onChange={(e) => handleInputChange(index, 'rewards', e.target.value)}
                    placeholder="Badge, Points, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {levels.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-muted-foreground">No fitscore levels defined. Click "Add Level" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitscoreSettings;
