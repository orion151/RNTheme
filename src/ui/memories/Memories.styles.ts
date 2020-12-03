import { AppColors, AppFonts } from '@ui/styles/AppStyles'
import { appStyled } from '@ui/styles/AppThemes'

export const MemoriesStyles = {
  Container: appStyled.SafeAreaView`
    flex: 1;
    background-color: ${(p) => p.theme.colors.primaryLight};
  `,
  PersonHeaderContainer: appStyled.View`
    flex-direction: row;
    justify-content: space-between;
    padding-top: 15px;
    padding-bottom: 5px;
    padding-horizontal: 8px;
  `,
  PersonHeaderTitleText: appStyled.Text.attrs({
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  })`
    color: ${AppColors.primaryDark};
    font-size: 16px;
    font-family: ${AppFonts.NBold};
    flex: 1;
  `,
  PersonHeaderSubTitleText: appStyled.Text`
    color: ${AppColors.neutralOnLight70};
    font-size: 13px;
    font-family: ${AppFonts.NBold};
  `,
  PersonMemoriesContainer: appStyled.View`
    flex-direction: row;
    flex-wrap: wrap;
  `,
}
